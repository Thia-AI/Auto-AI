import glob
import os
from pathlib import Path

from dateutil import parser
from flask import Flask, jsonify, request, send_from_directory, abort

from env import environment

# First thing we do is initialize file paths, env variables, etc.
environment.init_environment_pre_gpu()

from flask_socketio import SocketIO

import tensorflow as tf

# Jobs
from file_transfer.jobs.file_transfer_job import BulkFileTransferJob
from model_config.jobs.model_config_jobs import ModelCreationJob
from dataset.jobs.create_dataset_job import CreateDatasetJob
from dataset.jobs.delete_dataset_job import DeleteDatasetJob
from dataset.jobs.delete_all_inputs_from_dataset_job import DeleteAllInputsFromDatasetJob
# DB commands
from db.commands.job_commands import get_jobs, get_job
from db.commands.model_commands import get_models, get_model
from db.commands.dataset_commands import get_dataset, get_datasets, get_dataset_by_name, add_label, delete_label, get_labels, get_label, \
    increment_label_input_count, decrement_label_input_count, update_labels_of_dataset, add_label_input_count
from db.commands.input_commands import get_all_inputs, pagination_get_next_page_inputs, \
    pagination_get_prev_page_preview_inputs, pagination_get_prev_page_inputs, pagination_get_next_page_preview_inputs, \
    reset_labels_of_inputs, get_input, update_input_label
from db.row_accessors import dataset_from_row, job_from_row, model_from_row, input_from_row, label_from_row

from job.job import JobCreator
from log.logger import log
from config import config
from config import constants
from helpers.route import validate_req_json
from helpers.encoding import b64_encode, b64_decode
# Socket IO
from sio_namespaces.job_namespace import jobs_namespace

app = Flask(__name__, instance_path=Path(os.path.dirname(os.path.realpath(__file__))) / 'instance')

io = SocketIO(app, async_mode='threading')

io.on_namespace(jobs_namespace)

# sio = socketio.Server(async_mode='threading', logger=True, engineio_logger=True)
# app.wsgi_app = socketio.WSGIApp(sio, app.wsgi_app)

environment.init_environment_post_gpu()


@app.route('/devices', methods=['GET'])
def get_devices_route():
    log(f"ACCEPTED [{request.method}] {request.path}")
    out = []
    for device in tf.config.list_physical_devices():
        out.append({
            'name': device.name,
            'type': device.device_type
        })
    return jsonify(out)


@app.route('/dataset/<string:uuid>/inputs/upload', methods=['POST'])
def train_route(uuid: str):
    log(f"ACCEPTED [{request.method}] {request.path}")
    req_data = request.get_json()
    # Check to see if files key exists
    req_data_format = {
        'files': constants.REQ_HELPER_REQUIRED + constants.REQ_HELPER_SPLITTER + constants.REQ_HELPER_ARRAY_NON_EMPTY,
    }
    error_obj = validate_req_json(req_data, req_data_format)
    if error_obj is not None:
        return {'Error': error_obj}, 400
    rows = get_dataset(uuid)
    if rows is None:
        return {'Error': 'ID of dataset does not exist'}, 400
    try:
        files = req_data["files"]
    except (TypeError, KeyError) as e:
        return {'Error': "Didn't receive any input, try again with input"}, 400
    if len(files) == 0:
        return {'Error': "Didn't receive any input, try again with input"}, 400

    ids = JobCreator().create(BulkFileTransferJob((uuid, files))).queue()
    return {'ids': ids}, 202


@app.route('/jobs', methods=['GET'])
def get_jobs_route():
    log(f"ACCEPTED [{request.method}] {request.path}")
    rows = get_jobs()
    jobs = []
    for row in rows:
        job = job_from_row(row)
        jobs.append(job)

    return {'jobs': jobs}, 200


@app.route('/job/<string:uuid>', methods=['GET'])
def get_job_route(uuid: str):
    log(f"ACCEPTED [{request.method}] {request.path}")
    if len(uuid) != 32:
        return {'Error': "ID of job is of incorrect length"}, 400
    rows = get_job(uuid)
    if rows is None:
        return {'Error': "ID of job does not exist"}, 400
    for row in rows:
        return job_from_row(row), 200


@app.route('/model/create', methods=['POST'])
def create_model_route():
    log(f"ACCEPTED [{request.method}] {request.path}")
    req_data = request.get_json()
    req_data_format = {
        'model_name': constants.REQ_HELPER_REQUIRED + constants.REQ_HELPER_SPLITTER + constants.REQ_HELPER_STRING_NON_EMPTY,
        'model_type': constants.REQ_HELPER_REQUIRED + constants.REQ_HELPER_SPLITTER + constants.REQ_HELPER_STRING_NON_EMPTY,
        'model_type_extra': constants.REQ_HELPER_REQUIRED + constants.REQ_HELPER_SPLITTER + constants.REQ_HELPER_STRING_NON_EMPTY
    }
    error_obj = validate_req_json(req_data, req_data_format)
    if error_obj is not None:
        return {'Error': error_obj}, 400
    # check to see if model already exists
    if os.path.isdir(config.MODEL_DIR / req_data['model_name']):
        return {'Error': 'Model already exists'}, 400
    ids = JobCreator().create(ModelCreationJob(req_data)).queue()
    return {'ids': ids}, 202


@app.route('/models', methods=['GET'])
def get_models_route():
    log(f"ACCEPTED [{request.method}] {request.path}")
    rows = get_models()
    models = []
    for row in rows:
        model = model_from_row(row)
        models.append(model)

    return {'models': models}, 200


@app.route('/model/<string:uuid>', methods=['GET'])
def get_model_route(uuid: str):
    log(f"ACCEPTED [{request.method}] {request.path}")
    if len(uuid) != 32:
        return {'Error': "ID of model is of incorrect length"}, 400
    rows = get_model(uuid)
    if rows is None:
        return {'Error': "ID of model does not exist"}, 400
    for row in rows:
        return model_from_row(row), 200


@app.route('/dataset/create', methods=['POST'])
def create_dataset_route():
    log(f"ACCEPTED [{request.method}] {request.path}")
    req_data = request.get_json()
    req_data_format = {
        'name': constants.REQ_HELPER_REQUIRED + constants.REQ_HELPER_SPLITTER + constants.REQ_HELPER_STRING_NON_EMPTY,
        'type': constants.REQ_HELPER_REQUIRED + constants.REQ_HELPER_SPLITTER + constants.REQ_HELPER_STRING_NON_EMPTY
    }
    error_obj = validate_req_json(req_data, req_data_format)
    if error_obj is not None:
        return {'Error': error_obj}, 400
    # Check to see if dataset already exists
    if os.path.isdir(config.DATASET_DIR / req_data['name']):
        return {'Error': 'Dataset already exists'}, 400
    ids = JobCreator().create(CreateDatasetJob(req_data)).queue()
    return {'ids': ids}, 202


@app.route('/datasets', methods=['GET'])
def get_datasets_route():
    log(f"ACCEPTED [{request.method}] {request.path}")
    rows = get_datasets()
    datasets = []
    for row in rows:
        dataset = dataset_from_row(row)
        datasets.append(dataset)
    return {'datasets': datasets}, 200


@app.route('/dataset/<string:uuid>', methods=['GET'])
def get_dataset_route(uuid: str):
    log(f"ACCEPTED [{request.method}] {request.path}")
    if len(uuid) != 32:
        return {'Error': "ID of dataset is of incorrect length"}, 400
    rows = get_dataset(uuid)
    if rows is None or len(rows) == 0:
        return {'Error': "ID of dataset does not exist"}, 400
    for row in rows:
        return dataset_from_row(row), 200


@app.route('/dataset/by-name/<string:name>', methods=['GET'])
def get_dataset_by_name_route(name: str):
    log(f"ACCEPTED [{request.method}] {request.path}")
    if name is None or len(name) == 0:
        return {'Error': "Please enter an ID"}, 400

    rows = get_dataset_by_name(name)
    if rows is None or len(rows) == 0:
        return {'Error': "ID of dataset does not exist"}, 400
    for row in rows:
        return dataset_from_row(row), 200


@app.route('/dataset/<string:uuid>/first-image', methods=['GET'])
def get_dataset_first_image_route(uuid: str):
    log(f"ACCEPTED [{request.method}] {request.path}")
    if len(uuid) != 32:
        return {'Error': "ID of dataset is of incorrect length"}, 400
    rows = get_dataset(uuid)
    if rows is None or len(rows) == 0:
        return {'Error': "ID of dataset does not exist"}, 400
    for row in rows:
        # Only 1 row in rows but we access via iteration
        # Get images in dataset's input directory
        input_dir = str((config.DATASET_DIR / row['name'] / config.DATASET_INPUT_DIR_NAME).resolve())
        files = glob.glob1(input_dir, '*.jpg')
        if len(files) == 0:
            abort(404)
        try:
            return send_from_directory(input_dir, files[0])
        except FileNotFoundError:
            abort(404)


@app.route('/dataset/<string:uuid>', methods=['DELETE'])
def delete_dataset_route(uuid: str):
    log(f"ACCEPTED [{request.method}] {request.path}")
    if len(uuid) != 32:
        return {'Error': "ID of dataset is of incorrect length"}, 400
    rows = get_dataset(uuid)
    if rows is None or len(rows) == 0:
        return {'Error': "ID of dataset does not exist"}, 400
    ids = JobCreator().create(DeleteDatasetJob(uuid)).queue()
    return {'ids': ids}, 202


@app.route('/dataset/<string:uuid>/inputs', methods=['DELETE'])
def delete_all_inputs_from_dataset_route(uuid: str):
    log(f"ACCEPTED [{request.method}] {request.path}")
    if len(uuid) != 32:
        return {'Error': "ID of dataset is of incorrect length"}, 400
    rows = get_dataset(uuid)
    if rows is None or len(rows) == 0:
        return {'Error': "ID of dataset does not exist"}, 400
    ids = JobCreator().create(DeleteAllInputsFromDatasetJob(uuid)).queue()
    return {'ids': ids}, 202


@app.route('/inputs', methods=['GET'])
def get_all_inputs_route():
    log(f"ACCEPTED [{request.method}] {request.path}")
    rows = get_all_inputs()
    inputs = []
    for row in rows:
        db_input = input_from_row(row)
        inputs.append(db_input)

    return {'inputs': inputs}, 200


# Input pagination routes

@app.route('/dataset/<string:uuid>/inputs/cursor/next', methods=['POST'])
def get_next_inputs_route(uuid: str):
    log(f"ACCEPTED [{request.method}] {request.path}")
    if len(uuid) != 32:
        return {'Error': "ID of dataset is of incorrect length"}, 400
    rows = get_dataset(uuid)
    if rows is None or len(rows) == 0:
        return {'Error': "ID of dataset does not exist"}, 400

    req_data = request.get_json()
    req_data_format = {
        'current_cursor_date': constants.REQ_HELPER_REQUIRED + constants.REQ_HELPER_SPLITTER + constants.REQ_HELPER_STRING_NON_EMPTY + constants.REQ_HELPER_SPLITTER + constants.REQ_HELPER_BASE64_ENCODED_DATETIME,
        'limit': constants.REQ_HELPER_INTEGER_OPTIONAL
    }
    error_obj = validate_req_json(req_data, req_data_format)
    if error_obj is not None:
        return {'Error': error_obj}, 400
    # Check for limit range
    # TODO: Add a range checker in route_helpers to make this easier and reduce duplicated code
    if 'limit' in req_data and (req_data['limit'] <= 0 or req_data['limit'] > constants.INPUT_PAGINATION_LIMIT_MAX):
        return {'Error': f'limit provided is not in range 0 - {constants.INPUT_PAGINATION_LIMIT_MAX}'}, 400

    limit = req_data['limit'] if 'limit' in req_data else constants.INPUT_PAGINATION_DEFAULT_LIMIT
    # Get the next page inputs
    parsed_datetime = str(parser.parse(b64_decode(req_data['current_cursor_date'])))
    rows = pagination_get_next_page_inputs(uuid, parsed_datetime, limit + 1)
    inputs = []
    is_end_of_table = len(rows) != limit + 1
    trim_rows = rows if is_end_of_table else rows[:-1]
    for row in trim_rows:
        db_input = input_from_row(row)
        inputs.append(db_input)

    # Determine the next and previous cursors
    # Determine next cursor
    if is_end_of_table:
        next_cursor = None
    else:
        next_input = input_from_row(trim_rows[-1])
        next_cursor = b64_encode(next_input['date_created'])
    # Determine previous cursor
    prev_rows_preview = pagination_get_prev_page_preview_inputs(uuid, parsed_datetime)
    if len(prev_rows_preview) == 0:
        # No input before current cursor
        prev_cursor = None
    else:
        prev_input = input_from_row(trim_rows[0])
        prev_cursor = b64_encode(prev_input['date_created'])
    return {
               'inputs': inputs,
               'next_cursor': next_cursor,
               'previous_cursor': prev_cursor
           }, 200


@app.route('/dataset/<string:uuid>/inputs/cursor/previous', methods=['POST'])
def get_prev_inputs_route(uuid: str):
    log(f"ACCEPTED [{request.method}] {request.path}")
    if len(uuid) != 32:
        return {'Error': "ID of dataset is of incorrect length"}, 400
    rows = get_dataset(uuid)
    if rows is None or len(rows) == 0:
        return {'Error': "ID of dataset does not exist"}, 400

    req_data = request.get_json()
    req_data_format = {
        'current_cursor_date': constants.REQ_HELPER_REQUIRED + constants.REQ_HELPER_SPLITTER + constants.REQ_HELPER_STRING_NON_EMPTY + constants.REQ_HELPER_SPLITTER + constants.REQ_HELPER_BASE64_ENCODED_DATETIME,
        'limit': constants.REQ_HELPER_INTEGER_OPTIONAL
    }
    error_obj = validate_req_json(req_data, req_data_format)
    if error_obj is not None:
        return {'Error': error_obj}, 400
    # TODO: Add a range checker in route_helpers to make this easier and reduce duplicated code
    if 'limit' in req_data and (req_data['limit'] <= 0 or req_data['limit'] > constants.INPUT_PAGINATION_LIMIT_MAX):
        return {'Error': f'limit provided is not in range 0 - {constants.INPUT_PAGINATION_LIMIT_MAX}'}, 400
    limit = req_data['limit'] if 'limit' in req_data else constants.INPUT_PAGINATION_DEFAULT_LIMIT
    # Get the previous page inputs
    parsed_datetime = str(parser.parse(b64_decode(req_data['current_cursor_date'])))
    rows = pagination_get_prev_page_inputs(uuid, parsed_datetime, limit + 1)
    inputs = []
    is_end_of_table = len(rows) != limit + 1
    trim_rows = rows if is_end_of_table else rows[:-1]
    # We reverse because pagination_get_prev_page_inputs() returns inputs in descending order
    trim_rows.reverse()
    for row in trim_rows:
        db_input = input_from_row(row)
        inputs.append(db_input)

    # Determine next and previous cursors
    # Determine previous cursor
    if is_end_of_table:
        prev_cursor = None
    else:
        prev_input = input_from_row(trim_rows[0])
        prev_cursor = b64_encode(prev_input['date_created'])

    # Determine next cursor
    next_rows_preview = pagination_get_next_page_preview_inputs(uuid, parsed_datetime)
    if len(next_rows_preview) == 0:
        # No input after current cursor
        next_cursor = None
    else:
        next_input = input_from_row(trim_rows[-1])
        next_cursor = b64_encode(next_input['date_created'])
    return {
               'inputs': inputs,
               'next_cursor': next_cursor,
               'previous_cursor': prev_cursor
           }, 200


@app.route('/dataset/<string:uuid>/labels', methods=['GET'])
def get_dataset_labels_route(uuid: str):
    log(f"ACCEPTED [{request.method}] {request.path}")
    if len(uuid) != 32:
        return {'Error': "ID of dataset is of incorrect length"}, 400
    rows = get_dataset(uuid)
    if rows is None or len(rows) == 0:
        return {'Error': "ID of dataset does not exist"}, 400
    rows = get_labels(uuid)
    out = {}
    for row in rows:
        label = label_from_row(row)
        label_value = label['value']
        out[label_value] = label
    return out, 200


@app.route('/dataset/<string:uuid>/label/<string:label_value>', methods=['GET'])
def get_dataset_label_route(uuid: str, label_value: str):
    log(f"ACCEPTED [{request.method}] {request.path}")
    if len(uuid) != 32:
        return {'Error': "ID of dataset is of incorrect length"}, 400
    rows = get_dataset(uuid)
    if rows is None or len(rows) == 0:
        return {'Error': "ID of dataset does not exist"}, 400
    rows = get_label(uuid, label_value)
    label = {}
    for row in rows:
        label = label_from_row(row)
    return label, 200


@app.route('/input/<string:input_id>/update_label', methods=['PUT'])
def update_input_label_route(input_id: str):
    log(f"ACCEPTED [{request.method}] {request.path}")

    if len(input_id) != 32:
        return {'Error': "ID of input is of incorrect length"}, 400

    rows = get_input(input_id)
    if rows is None or len(rows) == 0:
        return {'Error': "ID of input does not exist"}, 400
    dataset_id = ''
    for row in rows:
        dataset_id = input_from_row(row)['dataset_id']

    req_data = request.get_json()
    req_data_format = {
        'previous_label': constants.REQ_HELPER_REQUIRED + constants.REQ_HELPER_SPLITTER + constants.REQ_HELPER_STRING_NON_EMPTY,
        'new_label': constants.REQ_HELPER_REQUIRED + constants.REQ_HELPER_SPLITTER + constants.REQ_HELPER_STRING_NON_EMPTY
    }
    error_obj = validate_req_json(req_data, req_data_format)
    if error_obj is not None:
        return {'Error': error_obj}, 400

    # Set input label to new label
    update_input_label(input_id, req_data['new_label'])
    # Increment current label input count
    increment_label_input_count(dataset_id, req_data['new_label'])
    # Decrement old label input count
    decrement_label_input_count(dataset_id, req_data['previous_label'])
    return {}, 200


@app.route('/dataset/<string:uuid>/labels/add', methods=['POST'])
def add_label_to_dataset(uuid: str):
    log(f"ACCEPTED [{request.method}] {request.path}")
    if len(uuid) != 32:
        return {'Error': "ID of dataset is of incorrect length"}, 400
    rows = get_dataset(uuid)
    if rows is None or len(rows) == 0:
        return {'Error': "ID of dataset does not exist"}, 400

    req_data = request.get_json()
    req_data_format = {
        'label': constants.REQ_HELPER_REQUIRED + constants.REQ_HELPER_SPLITTER + constants.REQ_HELPER_STRING_NON_EMPTY,
        'color': constants.REQ_HELPER_REQUIRED + constants.REQ_HELPER_SPLITTER + constants.REQ_HELPER_STRING_NON_EMPTY
    }
    error_obj = validate_req_json(req_data, req_data_format)
    if error_obj is not None:
        return {'Error': error_obj}, 400

    dataset = {}
    for row in rows:
        dataset = dataset_from_row(row)

    curr_labels: str = dataset['labels']
    if not curr_labels.strip():
        # Dataset doesn't have any labels
        labels = []
    else:
        labels = curr_labels.split(constants.DATASET_LABELS_SPLITTER)
    # Check if label exits
    if req_data['label'] in labels:
        return {'Error': 'Label already exists'}, 400
    # Create new labels string
    add_label(req_data['label'], dataset['id'], req_data['color'])
    labels.append(req_data['label'])
    labels_string = constants.DATASET_LABELS_SPLITTER.join(labels)
    update_labels_of_dataset(uuid, labels_string)
    # Return back dataset that was updated
    rows = get_dataset(uuid)
    dataset = {}
    for row in rows:
        dataset = dataset_from_row(row)
    rows = get_labels(uuid)
    labels_out = {}
    for row in rows:
        label = label_from_row(row)
        label_value = label['value']
        labels_out[label_value] = label
    return {'dataset': dataset, 'labels': labels_out}, 200


@app.route('/dataset/<string:uuid>/labels/remove', methods=['DELETE'])
def remove_label_from_dataset(uuid: str):
    log(f"ACCEPTED [{request.method}] {request.path}")
    if len(uuid) != 32:
        return {'Error': "ID of dataset is of incorrect length"}, 400
    rows = get_dataset(uuid)
    if rows is None or len(rows) == 0:
        return {'Error': "ID of dataset does not exist"}, 400

    req_data = request.get_json()
    req_data_format = {
        'label': constants.REQ_HELPER_REQUIRED + constants.REQ_HELPER_SPLITTER + constants.REQ_HELPER_STRING_NON_EMPTY
    }
    error_obj = validate_req_json(req_data, req_data_format)
    if error_obj is not None:
        return {'Error': error_obj}, 400

    dataset = {}
    for row in rows:
        dataset = dataset_from_row(row)

    # Get labels from dataset
    curr_labels: str = dataset['labels']
    labels = curr_labels.split(constants.DATASET_LABELS_SPLITTER)
    if req_data['label'] not in labels:
        return {'Error': f"label '{req_data['label']}' doesn't exist"}

    # Transfer input count from label to delete to unlabelled
    rows = get_label(uuid, req_data['label'])
    label = {}
    for row in rows:
        label = label_from_row(row)
    input_count_to_transfer = label['input_count']
    add_label_input_count(uuid, 'unlabelled', input_count_to_transfer)
    # Remove from labels
    delete_label(req_data['label'], uuid)
    labels.remove(req_data['label'])
    labels_string = constants.DATASET_LABELS_SPLITTER.join(labels)
    update_labels_of_dataset(uuid, labels_string)
    # Reset input labels
    reset_labels_of_inputs(uuid, req_data['label'])
    # Return back dataset that was updated
    rows = get_dataset(uuid)
    dataset = {}
    for row in rows:
        dataset = dataset_from_row(row)
    rows = get_labels(uuid)
    labels_out = {}
    for row in rows:
        label = label_from_row(row)
        label_value = label['value']
        labels_out[label_value] = label
    return {'dataset': dataset, 'labels': labels_out}, 200


@app.route('/dataset/<string:uuid>/labels/order', methods=['PATCH'])
def update_labels_from_dataset(uuid: str):
    log(f"ACCEPTED [{request.method}] {request.path}")
    if len(uuid) != 32:
        return {'Error': "ID of dataset is of incorrect length"}, 400
    rows = get_dataset(uuid)
    if rows is None or len(rows) == 0:
        return {'Error': "ID of dataset does not exist"}, 400

    req_data = request.get_json()
    req_data_format = {
        'labels': constants.REQ_HELPER_REQUIRED + constants.REQ_HELPER_SPLITTER + constants.REQ_HELPER_STRING_ARRAY_NON_EMPTY
    }
    error_obj = validate_req_json(req_data, req_data_format)
    if error_obj is not None:
        return {'Error': error_obj}, 400

    dataset = {}
    for row in rows:
        dataset = dataset_from_row(row)

    labels_new_split: list = req_data['labels']
    labels_new_set = set(labels_new_split)

    labels_unsplit: str = dataset['labels']
    labels = labels_unsplit.split(constants.DATASET_LABELS_SPLITTER)
    labels_set = set(labels)

    for label in labels:
        if label not in labels_new_set:
            return {'Error': 'Labels missing, must only include all existing labels to update their order'}, 400

    if len(labels_new_set - labels_set) != 0:
        return {'Error': 'Extra labels included, must only include all existing labels to update their order'}, 400

    labels_new = constants.DATASET_LABELS_SPLITTER.join(labels_new_split)
    update_labels_of_dataset(uuid, labels_new)

    # Return back dataset that was updated
    rows = get_dataset(uuid)
    dataset = {}
    for row in rows:
        dataset = dataset_from_row(row)
    rows = get_labels(uuid)
    labels_out = {}
    for row in rows:
        label = label_from_row(row)
        label_value = label['value']
        labels_out[label_value] = label
    return {'dataset': dataset, 'labels': labels_out}, 200


@app.route('/dataset/<string:dataset_id>/input/<string:input_id>', methods=['GET'])
def get_input_image(dataset_id: str, input_id: str):
    log(f"ACCEPTED [{request.method}] {request.path}")
    if len(dataset_id) != 32:
        return {'Error': "ID of dataset is of incorrect length"}, 400
    if len(input_id) != 32:
        return {'Error': "ID of input is of incorrect length"}, 400
    rows = get_dataset(dataset_id)
    if rows is None or len(rows) == 0:
        return {'Error': "ID of dataset does not exist"}, 400
    # So that pycharm doesn't throw a warning saying dataset_name is referenced before assignment
    dataset_name = ''
    for row in rows:
        dataset_name: str = row['name']
    rows = get_input(input_id)
    if rows is None or len(rows) == 0:
        return {'Error': "ID of input does not exist"}, 400
    for row in rows:
        file_name: str = row['file_name']
        try:
            return send_from_directory(str((config.DATASET_DIR / dataset_name / config.DATASET_INPUT_DIR_NAME).resolve()), file_name)
        except FileNotFoundError:
            return {'Error': "File not found"}, 404


if __name__ == '__main__':
    # app.run(host='localhost', port=8442, threaded=True)
    io.run(app, host='localhost', port=8442)
