import csv
import glob
import io as py_io
import json
import os
import tempfile
import uuid
from datetime import datetime
from pathlib import Path
import sys

import numpy as np
from dateutil import parser as date_parser
from flask import Flask, jsonify, request, send_from_directory, abort, make_response
from flask_socketio import SocketIO
from werkzeug.utils import secure_filename
from multiprocessing import current_process

from config import config
from env import environment

environment.init_common_env(sys.argv[1])

from config import constants
from config.constants import ICModelStatus, POSSIBLE_IC_MODEL_EXPORT_TYPES, POSSIBLE_IC_MODEL_LABELLING_TYPES, POSSIBLE_IC_MODEL_TYPES, \
    POSSIBLE_MODEL_TYPES, ICTrainJobStatus
from dataset.jobs.create_dataset_job import CreateDatasetJob
from dataset.jobs.delete_all_inputs_from_dataset_job import DeleteAllInputsFromDatasetJob
from dataset.jobs.delete_dataset_job import DeleteDatasetJob
from dataset.jobs.update_many_input_labels_job import UpdateManyInputLabelsJob
from db.commands.dataset_commands import get_dataset, get_datasets, get_dataset_by_name, add_label, delete_label, get_labels, get_label, \
    update_labels_of_dataset, get_num_datasets, \
    update_dataset_last_accessed
# Export commands
from db.commands.export_commands import add_export_to_db, get_active_model_exports, get_num_exports
# Input commands
from db.commands.input_commands import get_all_inputs, pagination_get_next_page_inputs, \
    pagination_get_prev_page_preview_inputs, pagination_get_prev_page_inputs, pagination_get_next_page_preview_inputs, \
    reset_labels_of_inputs, get_input, get_num_inputs, get_num_labels, update_input_label, get_train_data_from_all_inputs, delete_input
# DB commands
from db.commands.job_commands import get_jobs, get_job
from db.commands.model_commands import get_models, get_model, update_model_train_job_id, get_num_models, update_model_dataset_trained_on
from db.row_accessors import dataset_from_row, job_from_row, model_from_row, input_from_row, label_from_row, export_from_row
from decorators.verify_action import verify_action
from exports.export_model_job import ExportModelJob
# Jobs
from helpers.encoding import b64_encode, b64_decode
from helpers.route import validate_req_json
# Other
from job.job import JobCreator, JobManager
from log.logger import log
from model_config.jobs.create_model_job import ModelCreationJob
from model_config.jobs.delete_model_job import ModelDeletionJob
# Socket IO
from sio_namespaces.job_namespace import jobs_namespace
from train.jobs.test_ic_model import TestImageClassificationModelJob
from train.jobs.train_ic_job import TrainImageClassifierJob

app = Flask(__name__, instance_path=Path(os.path.dirname(os.path.realpath(__file__))) / 'instance')


# sio = socketio.Server(async_mode='threading', logger=True, engineio_logger=True)
# app.wsgi_app = socketio.WSGIApp(sio, app.wsgi_app)


@app.route('/devices', methods=['GET'])
def get_devices_route():
    import tensorflow as tf
    log(f"ACCEPTED [{request.method}] {request.path}")
    out = []
    for device in tf.config.list_physical_devices():
        out.append({
            'name': device.name,
            'type': device.device_type
        })
    return jsonify(out)


@app.route('/dataset/<string:uuid>/inputs/upload', methods=['POST'])
@verify_action()
def upload_inputs_route(uuid: str):
    log(f"ACCEPTED [{request.method}] {request.path}")
    req_data = request.get_json()
    # Check to see if files key exists
    req_data_format = {
        'files': constants.REQ_HELPER_REQUIRED + constants.REQ_HELPER_SPLITTER + constants.REQ_HELPER_ARRAY_NON_EMPTY,
    }
    error_obj = validate_req_json(req_data, req_data_format)
    if error_obj is not None:
        return {'Error': error_obj}, 400
    if len(uuid) != 32:
        return {'Error': "ID of dataset is of incorrect length"}, 400
    rows = get_dataset(uuid)
    if rows is None or len(rows) == 0:
        return {'Error': 'ID of dataset does not exist'}, 400
    try:
        files = req_data["files"]
    except (TypeError, KeyError) as e:
        return {'Error': "Didn't receive any input, try again with input"}, 400
    if len(files) == 0:
        return {'Error': "Didn't receive any input, try again with input"}, 400

    from file_transfer.jobs.file_transfer_job import BulkFileTransferJob
    ids = JobCreator().create(BulkFileTransferJob((uuid, files, request.path, request.method, request.headers.get('Authorization', '')))).queue()
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
    if len(uuid) != 32:
        return {'Error': "ID of job is of incorrect length"}, 400
    rows = get_job(uuid)
    if rows is None or len(rows) == 0:
        return {'Error': "ID of job does not exist"}, 400
    for row in rows:
        return job_from_row(row), 200


@app.route('/job/train/<string:uuid>', methods=['GET'])
def get_train_job_route(uuid: str):
    # TODO: Add check to see whether job is a training job or not.
    if len(uuid) != 32:
        return {'Error': "ID of job is of incorrect length"}, 400
    rows = get_job(uuid)
    if rows is None or len(rows) == 0:
        return {'Error': "ID of job does not exist"}, 400
    job = dict()
    for row in rows:
        job = dict(job_from_row(row))

    if job.get('extra_data', None) is not None and 'model_name' in job['extra_data']:
        # Training has passed initialization start
        extra_data_path = config.MODEL_DIR / job['extra_data']['model_name'] / config.MODEL_TRAINING_TIME_EXTRA_DATA_NAME
        if extra_data_path.is_file():
            # Training is still in progress. Load extra_data's history from training-time file instead
            # and overwrite it.
            try:
                with open(extra_data_path.absolute(), 'r') as f:
                    extra_data: dict = json.load(f)
                    # Remove error as any errors found when training isn't complete, are temporary errors
                    extra_data.pop('error', None)
                    if extra_data['status'] == ICTrainJobStatus.ERROR.value:
                        extra_data['status'] = ICTrainJobStatus.STARTING_TRAINING.value
                        extra_data['status_description'] = 'Reducing batch size and retrying'
                    job.update({'extra_data': extra_data})
            except:
                return job
    return job


@app.route('/model/create', methods=['POST'])
@verify_action()
def create_model_route():
    log(f"ACCEPTED [{request.method}] {request.path}")
    req_data = request.get_json()
    req_data_format = {
        'model_name': constants.REQ_HELPER_REQUIRED + constants.REQ_HELPER_SPLITTER + constants.REQ_HELPER_STRING_NON_EMPTY,
        'model_type': constants.REQ_HELPER_REQUIRED + constants.REQ_HELPER_SPLITTER + constants.REQ_HELPER_STRING_NON_EMPTY,
        'model_type_extra': constants.REQ_HELPER_REQUIRED + constants.REQ_HELPER_SPLITTER + constants.REQ_HELPER_STRING_NON_EMPTY,
        'labelling_type': constants.REQ_HELPER_REQUIRED + constants.REQ_HELPER_SPLITTER + constants.REQ_HELPER_STRING_NON_EMPTY
    }
    error_obj = validate_req_json(req_data, req_data_format)
    if error_obj is not None:
        return {'Error': error_obj}, 400
    if req_data['model_type'] not in POSSIBLE_MODEL_TYPES:
        return {'Error': f"Model Type: '{req_data['model_type']}' is an invalid model type"}, 400
    if req_data['labelling_type'] not in POSSIBLE_IC_MODEL_LABELLING_TYPES:
        return {'Error': f"Labelling type: '{req_data['labelling_type']}' is an invalid labelling type"}, 400
    if req_data['model_type_extra'] not in POSSIBLE_IC_MODEL_TYPES:
        return {'Error': f"Model Type Extra: '{req_data['model_type_extra']}' is an invalid image classification model type"}, 400
    # Check to see if model already exists
    if os.path.isdir(config.MODEL_DIR / req_data['model_name']):
        return {'Error': 'Model already exists'}, 400
    ids = JobCreator().create(ModelCreationJob([req_data, request.path, request.method, request.headers.get('Authorization', '')])).queue()
    return {'ids': ids}, 202


@app.route('/model/<string:model_id>', methods=['DELETE'])
@verify_action()
def delete_model_route(model_id: str):
    log(f"ACCEPTED [{request.method}] {request.path}")
    if len(model_id) != 32:
        return {'Error': "ID of model is of incorrect length"}, 400
    rows = get_model(model_id)
    if rows is None or len(rows) == 0:
        return {'Error': "ID of model does not exist"}, 400
    model = {}
    for row in rows:
        model = model_from_row(row)
    ids = JobCreator().create(ModelDeletionJob([model, request.path, request.method, request.headers.get('Authorization', '')])).queue()
    return {'ids': ids}, 202


@app.route('/model/<string:model_id>/export', methods=['POST'])
@verify_action()
def export_model_route(model_id: str):
    log(f"ACCEPTED [{request.method}] {request.path}")
    req_data = request.get_json()
    req_data_format = {
        'export_type': constants.REQ_HELPER_REQUIRED + constants.REQ_HELPER_SPLITTER + constants.REQ_HELPER_STRING_NON_EMPTY,
        'save_dir': constants.REQ_HELPER_REQUIRED + constants.REQ_HELPER_SPLITTER + constants.REQ_HELPER_STRING_NON_EMPTY
    }
    error_obj = validate_req_json(req_data, req_data_format)
    if error_obj is not None:
        return {'Error': error_obj}, 400
    if len(model_id) != 32:
        return {'Error': "ID of model is of incorrect length"}, 400
    rows = get_model(model_id)
    if rows is None or len(rows) == 0:
        return {'Error': "ID of model does not exist"}, 400
    model = {}
    for row in rows:
        model = model_from_row(row)
    # Check save path make sure it's a directory
    save_dir = Path(req_data['save_dir'])
    if not save_dir.is_dir():
        return {'Error': "'save_dir' must be a valid directory"}, 400
    save_dir = save_dir / model['model_name']
    # Make sure folder is empty
    if save_dir.exists() and save_dir.is_dir():
        return {'Error': f"'save_dir' cannot contain folder with same name as model name: '{model['model_name']}'"}, 400
    if req_data['export_type'] not in POSSIBLE_IC_MODEL_EXPORT_TYPES:
        return {'Error': f"Export type: '{req_data['export_type']}' an is invalid export type"}, 400
    export_id = uuid.uuid4().hex
    export_date = datetime.now()
    ids = JobCreator().create(ExportModelJob([model_id, req_data['export_type'], export_id, save_dir, export_date, request.path, request.method,
                                              request.headers.get('Authorization', '')])).queue()
    add_export_to_db(model_id, ids[0], str(save_dir.absolute()), req_data['export_type'], export_id, export_date)
    return {'ids': ids}, 202


@app.route('/model/<string:model_id>/active_exports', methods=['GET'])
def get_active_model_exports_route(model_id: str):
    log(f"ACCEPTED [{request.method}] {request.path}")
    if len(model_id) != 32:
        return {'Error': "ID of model is of incorrect length"}, 400
    rows = get_model(model_id)
    if rows is None or len(rows) == 0:
        return {'Error': "ID of model does not exist"}, 400
    rows = get_active_model_exports(model_id)
    exports = []
    for row in rows:
        export = export_from_row(row)
        exports.append(export)
    if len(exports) == 0:
        return {'exports': None}, 200
    return {'exports': exports}, 200


@app.route('/model/<string:model_id>/train', methods=['POST'])
@verify_action()
def train_model_route(model_id):
    log(f"ACCEPTED [{request.method}] {request.path}")
    req_data = request.get_json()
    # TODO: Implement optional body keys
    # req_data_format = {
    #     'dataset_id': constants.REQ_HELPER_REQUIRED + constants.REQ_HELPER_SPLITTER + constants.REQ_HELPER_STRING_NON_EMPTY,
    # }
    # error_obj = validate_req_json(req_data, req_data_format)
    # if error_obj is not None:
    #     return {'Error': error_obj}, 400

    if len(model_id) != 32:
        return {'Error': "ID of model is of incorrect length"}, 400
    rows = get_model(model_id)
    if rows is None or len(rows) == 0:
        return {'Error': "ID of model does not exist"}, 400
    model = {}
    for row in rows:
        model = model_from_row(row)

    status = model['model_status']
    if status == ICModelStatus.TRAINING.value or status == ICModelStatus.RETRAINING.value or status == ICModelStatus.STARTING_TRAINING:
        return {'Error': 'Model is currently being trained'}, 400
    if status == ICModelStatus.TRAINED.value:
        return {'Error': 'Model has already been trained'}, 400

    if model['dataset_trained_on'] is not None:
        dataset_id = model['dataset_trained_on']
    else:
        dataset_id = req_data['dataset_id']
    if dataset_id is None:
        return {'Error': 'dataset_id is not provided'}, 400

    if len(dataset_id) != 32:
        return {'Error': "ID of dataset is of incorrect length"}, 400
    rows = get_dataset(dataset_id)
    if rows is None or len(rows) == 0:
        return {'Error': "ID of dataset does not exist"}, 400

    # Validate that all inputs are labelled
    inputs: np.ndarray = get_train_data_from_all_inputs(dataset_id)
    input_labels = inputs[:, 1]
    if constants.DATASET_UNLABELLED_LABEL in input_labels:
        return {'Error': 'Dataset contains unlabelled inputs'}, 400
    # Update dataset the model is being trained on
    update_model_dataset_trained_on(model_id, dataset_id)
    # Delete extra_data.json file from model directory if it contains it before training
    extra_data_file_path = config.MODEL_DIR / model['model_name'] / config.MODEL_TRAINING_TIME_EXTRA_DATA_NAME
    try:
        if extra_data_file_path.is_file():
            extra_data_file_path.unlink()
    except Exception as e:
        log(e)
    # Train
    ids = JobCreator().create(TrainImageClassifierJob([model_id, dataset_id, model['latest_train_job_id']])).queue()
    update_model_train_job_id(model_id, ids[0])
    return {'ids': ids}, 202


@app.route('/job/<string:job_id>/cancel', methods=['DELETE'])
def cancel_job(job_id: str):
    log(f"ACCEPTED [{request.method}] {request.path}")

    if len(job_id) != 32:
        return {'Error': "ID of job is of incorrect length"}, 400
    rows = get_job(job_id)
    if rows is None or len(rows) == 0:
        return {'Error': "ID of job does not exist"}, 400
    job = {}
    for row in rows:
        job = job_from_row(row)
    if job['job_name'] not in constants.CANCELLABLE_JOBS:
        return {'Error': 'Only Testing jobs can be cancelled'}
    job_found, job_cancelled = JobManager.get_instance().cancel_job(job_id)
    return {'job_cancelled_successfully': job_cancelled, 'job_found': job_found}, 200


@app.route('/model/<string:model_id>/test', methods=['POST'])
@verify_action()
def test_model_route(model_id: str):
    log(f"ACCEPTED [{request.method}] {request.path}")
    if len(model_id) != 32:
        return {'Error': "ID of model is of incorrect length"}, 400
    rows = get_model(model_id)
    if rows is None or len(rows) == 0:
        return {'Error': "ID of model does not exist"}, 400
    model = {}
    for row in rows:
        model = model_from_row(row)

    status = model['model_status']
    if status != ICModelStatus.TRAINED.value:
        return {'Error': 'Model must be trained to test'}, 400

    files = request.files.getlist('files')
    if len(files) == 0:
        return {'Error': 'Did not attach any images to test'}, 400
    filenames = []
    temp_dir = Path(tempfile.mkdtemp())
    for file in files:
        filename = temp_dir / secure_filename(file.filename)
        try:
            file.save(filename)
            filenames.append(filename)
        except Exception:
            log(f'Unable to save {filename}')
    ids = JobCreator().create(TestImageClassificationModelJob([temp_dir, filenames, model['model_name'], model['extra_data'],
                                                               model['model_type_extra']])).queue()
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


@app.route('/model/<string:model_id>/labels-csv', methods=['GET'])
def get_model_labels_csv_route(model_id: str):
    log(f"ACCEPTED [{request.method}] {request.path}")
    if len(model_id) != 32:
        return {'Error': "ID of model is of incorrect length"}, 400
    rows = get_model(model_id)
    if rows is None or len(rows) == 0:
        return {'Error': "ID of model does not exist"}, 400
    model = {}
    for row in rows:
        model = model_from_row(row)
    if model['model_status'] == ICModelStatus.TRAINED.value:
        try:
            labels_to_class_map: dict = model['extra_data']['trained_model']['labels_to_class_map']
            labels_to_class_array = []
            for label, model_class in labels_to_class_map.items():
                label_to_model_class_map = {
                    'label': label,
                    'class': model_class
                }
                labels_to_class_array.append(label_to_model_class_map)
            csv_headers = ['label', 'class']
            io_string = py_io.StringIO()
            writer = csv.DictWriter(io_string, fieldnames=csv_headers)
            writer.writeheader()
            writer.writerows(labels_to_class_array)
            labels_class_csv_string = io_string.getvalue()
            output = make_response(labels_class_csv_string)
            output.headers["Content-Disposition"] = "attachment; filename=labels_to_class.csv"
            output.headers["Content-type"] = "text/csv"
            output.headers["X-Suggested-Filename"] = 'labels_to_class.csv'
            return output

        except Exception as e:
            log(e)
            return {'Error': 'Labels cannot be access for model'}, 400

    else:
        return {'Error': 'Model has not been trained'}, 400


@app.route('/model/<string:uuid>', methods=['GET'])
@verify_action()
def get_model_route(uuid: str):
    log(f"ACCEPTED [{request.method}] {request.path}")
    if len(uuid) != 32:
        return {'Error': "ID of model is of incorrect length"}, 400
    rows = get_model(uuid)
    if rows is None or len(rows) == 0:
        return {'Error': "ID of model does not exist"}, 400
    for row in rows:
        return model_from_row(row), 200


@app.route('/dataset/create', methods=['POST'])
@verify_action()
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
    ids = JobCreator().create(CreateDatasetJob([req_data, request.path, request.method, request.headers.get('Authorization', '')])).queue()
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
        input_dir = str((config.DATASET_DIR / row['name'] / config.DATASET_INPUT_DIR_NAME).absolute())
        files = glob.glob1(input_dir, '*.jpg')
        if len(files) == 0:
            abort(404)
        try:
            return send_from_directory(input_dir, files[0])
        except FileNotFoundError:
            abort(404)


@app.route('/dataset/<string:uuid>', methods=['DELETE'])
@verify_action()
def delete_dataset_route(uuid: str):
    log(f"ACCEPTED [{request.method}] {request.path}")
    if len(uuid) != 32:
        return {'Error': "ID of dataset is of incorrect length"}, 400
    rows = get_dataset(uuid)
    if rows is None or len(rows) == 0:
        return {'Error': "ID of dataset does not exist"}, 400
    ids = JobCreator().create(DeleteDatasetJob([uuid, request.path, request.method, request.headers.get('Authorization', '')])).queue()
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
    parsed_datetime = str(date_parser.parse(b64_decode(req_data['current_cursor_date'])))
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
    parsed_datetime = str(date_parser.parse(b64_decode(req_data['current_cursor_date'])))
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
    update_dataset_last_accessed(dataset_id)
    return {}, 200


@app.route('/dataset/<string:dataset_id>/inputs/update-labels-many', methods=['PUT'])
def update_multiple_input_labels_of_dataset(dataset_id: str):
    log(f"ACCEPTED [{request.method}] {request.path}")
    if len(dataset_id) != 32:
        return {'Error': "ID of dataset is of incorrect length"}, 400
    rows = get_dataset(dataset_id)
    if rows is None or len(rows) == 0:
        return {'Error': "ID of dataset does not exist"}, 400
    if config.ENGINE_BATCH_LABELLING_RUNNING:
        return {'Error': 'A batch labelling process is already running, wait for it to finish'}, 400
    label_json_file = request.files.get('file', None)
    if label_json_file is None or label_json_file.filename.strip() == '':
        return {'Error': 'Label file not defined'}
    label_json_file.stream.seek(0)
    try:
        label_dict: dict = json.loads(label_json_file.stream.read().decode())
    except json.JSONDecodeError:
        return {'Error': 'Error parsing label file'}, 400
    # Check if labels in label JSON file contain labels in the dataset
    all_labels = set(label_dict.values())
    label_rows = get_labels(dataset_id)
    dataset_labels_dict = {}
    for row in label_rows:
        label = label_from_row(row)
        label_value = label['value']
        dataset_labels_dict[label_value] = label
    all_dataset_labels = set(dataset_labels_dict.keys())
    if not all_labels.issubset(all_dataset_labels):
        return {'Error': 'Labels file contains labels not in dataset, consider adding them first'}, 400
    # Generate executemany list
    # Each item in list must be (label, dataset_id, file_name)
    values_list = []
    for input_name, input_label in label_dict.items():
        values_list.append((input_label, dataset_id, input_name + '.jpg'))
    ids = JobCreator().create(UpdateManyInputLabelsJob(values_list)).queue()
    return {'ids': ids}, 202


@app.route('/dataset/<string:uuid>/labels/add', methods=['POST'])
@verify_action()
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
    update_dataset_last_accessed(uuid)
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
@verify_action()
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
    # Remove from labels
    delete_label(req_data['label'], uuid)
    labels.remove(req_data['label'])
    labels_string = constants.DATASET_LABELS_SPLITTER.join(labels)
    update_labels_of_dataset(uuid, labels_string)
    # Reset input labels
    reset_labels_of_inputs(uuid, req_data['label'])
    update_dataset_last_accessed(uuid)
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

    # Return dataset that was updated
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


@app.route('/dataset/<string:dataset_id>/input/<string:input_id>', methods=['DELETE'])
@verify_action()
def delete_input_from_dataset(dataset_id: str, input_id: str):
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
    dataset_input = {}
    for row in rows:
        dataset_input = input_from_row(row)
    # Delete input from file system
    dataset_input_path = config.DATASET_DIR / dataset_name / config.DATASET_INPUT_DIR_NAME / dataset_input['file_name']
    dataset_input_path.unlink(missing_ok=True)
    # Delete input from db
    delete_input(input_id)
    return {'input': dataset_input}, 200


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
            return send_from_directory(str((config.DATASET_DIR / dataset_name / config.DATASET_INPUT_DIR_NAME).absolute()), file_name)
        except FileNotFoundError:
            return {'Error': "File not found"}, 404


@app.route('/telemetry/memory', methods=['GET'])
def get_gpu_memory_info_route():
    import GPUtil
    log(f"ACCEPTED [{request.method}] {request.path}")
    gpus = GPUtil.getGPUs()
    out = {}
    gpu_memory_info = {}
    for gpu in gpus:
        curr_gpu = {
            'name': gpu.name,
            'id': gpu.id,
            'memoryFree': gpu.memoryFree,
            'memoryUsed': gpu.memoryUsed,
            'memoryTotal': gpu.memoryTotal,
            'load': gpu.load,
            'memoryUtil': gpu.memoryUtil,
            'driverVersion': gpu.driver,
        }
        gpu_memory_info[f'/device:GPU:{gpu.id}'] = curr_gpu
    out['gpu_memory_info'] = gpu_memory_info
    return out, 200


@app.route('/telemetry/gpu_state', methods=['GET'])
def get_gpu_state_route():
    log(f"ACCEPTED [{request.method}] {request.path}")
    return {
               'gpu_task_running': config.ENGINE_GPU_TASK_RUNNING,
               'test_task_running': config.ENGINE_TEST_TASK_RUNNING
           }, 200


@app.route('/telemetry/quick_stats', methods=['GET'])
def quick_stats_route():
    log(f"ACCEPTED [{request.method}] {request.path}")
    num_models = get_num_models()
    num_exports = get_num_exports()
    num_datasets = get_num_datasets()
    num_images = get_num_inputs()
    num_labels = get_num_labels()
    return {
               'num_models': num_models,
               'num_exports': num_exports,
               'num_datasets': num_datasets,
               'num_images': num_images,
               'num_labels': num_labels
           }, 200


if __name__ == '__main__' and current_process().name == 'MainProcess':
    log('PARSING ARGS')
    import argparse
    # https://docs.python.org/3.7/library/multiprocessing.html?highlight=process#multiprocessing.freeze_support
    from multiprocessing import freeze_support

    freeze_support()

    parser = argparse.ArgumentParser(description='Thia ML Engine')
    parser.add_argument('environment', nargs='?')
    parser.add_argument('-u', '--user', required=True, help='User UID')
    parser.add_argument('-ud', '--user-data', required=True, help='User Data Path')
    args = parser.parse_args()
    log(f'Args Passed: {args}')


    environment.init_environment_pre_gpu(args)

    import tensorflow as tf

    app.config['user'] = args.user

    io = SocketIO(app, async_mode='threading')
    io.on_namespace(jobs_namespace)
    environment.init_environment_post_gpu()
    io.run(app, host='localhost', port=8442, use_reloader=False)
