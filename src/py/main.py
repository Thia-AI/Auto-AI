import base64
import glob
import os
from pathlib import Path
from dateutil import parser

from flask import Flask, jsonify, request

from env import environment

# First thing we do is initialize file paths, env variables, etc.
environment.init_environment_pre_gpu()

# Jobs
from file_transfer.jobs.file_transfer_job import BulkFileTransferJob
from model_config.jobs.model_config_jobs import ModelCreationJob
from dataset.jobs.create_dataset_job import CreateDatasetJob
from dataset.jobs.delete_dataset_job import DeleteDatasetJob
from dataset.jobs.delete_all_inputs_from_dataset_job import DeleteAllInputsFromDatasetJob
# DB commands
from db.commands.job_commands import get_jobs, get_job
from db.commands.model_commands import get_models, get_model
from db.commands.dataset_commands import get_dataset, get_datasets, get_dataset_by_name
from db.commands.input_commands import get_all_inputs, pagination_get_next_page_inputs, \
    pagination_get_prev_page_preview_inputs, pagination_get_prev_page_inputs, pagination_get_next_page_preview_inputs
from db.row_accessors import dataset_from_row, job_from_row, model_from_row, input_from_row

from job.job import JobCreator
from log.logger import log
from config import config
from config import constants
from helpers.route import validate_req_json
from helpers.encoding import b64_encode, b64_decode

import tensorflow as tf

app = Flask(__name__, instance_path=Path(os.path.dirname(os.path.realpath(__file__))) / 'instance')

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


@app.route('/dataset/first-image/<string:uuid>', methods=['GET'])
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
        input_dir = (config.DATASET_DIR / row['name'] / config.DATASET_INPUT_DIR_NAME).absolute()
        files = glob.glob(str(input_dir) + os.path.sep + '*.jpg')
        if len(files) == 0:
            return {'image': ''}, 200
        with open(files[0], 'rb') as image:
            # Return base64 encoded image that we can pass directly as src to <img /> tag
            encoded = base64.b64encode(image.read()).decode('utf-8')
            base64_output = 'data:image/jpg;base64,{}'.format(encoded)
            return {'image': base64_output}, 200


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

@app.route('/dataset/<string:uuid>/inputs/cursor/next', methods=['GET'])
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


@app.route('/dataset/<string:uuid>/inputs/cursor/previous', methods=['GET'])
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


if __name__ == '__main__':
    app.run(host='localhost', port=8442, threaded=True)
