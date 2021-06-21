import os

from flask import Flask, jsonify, request

from env import environment

# First thing we do is initialize file paths, env variables, etc.
environment.init_environment_pre_gpu()

# Jobs
from file_transfer.jobs.file_transfer_job import BulkFileTransferJob
from model_config.jobs.model_config_jobs import ModelCreationJob

from db.commands.job_commands import get_jobs, get_job
from db.commands.model_commands import get_models, get_model

from job.job import JobCreator
from log.logger import log
from config import config
from config import route_helper_constants as req_constants
from helpers import route_helpers

import tensorflow as tf

app = Flask(__name__)

environment.init_environment_post_gpu()


@app.route('/devices', methods=['GET'])
def get_devices_route():
    log(f"ACCEPTED [{request.method}] /devices")
    out = []
    for device in tf.config.list_physical_devices():
        out.append({
            'name': device.name,
            'type': device.device_type
        })
    return jsonify(out)


@app.route('/train', methods=['POST'])
def train_route():
    log(f"ACCEPTED [{request.method}] /train")
    req_data = request.get_json()
    # Check to see if files key exists
    try:
        files = req_data["files"]
    except (TypeError, KeyError) as e:
        return {'Error': "Didn't receive any input, try again with input"}, 400
    if len(files) == 0:
        return {'Error': "Didn't receive any input, try again with input"}, 400

    ids = JobCreator().create(BulkFileTransferJob(files)).queue()
    return {'ids': ids}, 202


@app.route('/jobs', methods=['GET'])
def get_jobs_route():
    log(f"ACCEPTED [{request.method}] /jobs")
    rows = get_jobs()
    jobs = []
    for row in rows:
        job = {
            'id': row['id'],
            'job_name': row['job_name'],
            'has_started': bool(row['has_started']),
            'has_finished': bool(row['has_finished']),
            'status': row['status'],
            'date_started': row['date_started'],
            'date_finished': row['date_finished'],
            'progress': row['progress'],
            'progress_max': row['progress_max']
        }
        jobs.append(job)

    return {'jobs': jobs}, 200


@app.route('/job/<string:uuid>', methods=['GET'])
def get_job_route(uuid: str):
    log(f"ACCEPTED [{request.method}] /job/{uuid}")
    if len(uuid) != 32:
        return {'Error': "ID of job is of incorrect length"}, 400
    rows = get_job(uuid)
    if rows is None:
        return {'Error': "ID of job does not exist"}, 400
    for row in rows:
        return {
                   'id': row['id'],
                   'job_name': row['job_name'],
                   'has_started': bool(row['has_started']),
                   'has_finished': bool(row['has_finished']),
                   'status': row['status'],
                   'date_started': row['date_started'],
                   'date_finished': row['date_finished'],
                   'progress': row['progress'],
                   'progress_max': row['progress_max']
               }, 200


@app.route('/model/create', methods=['POST'])
def create_model_route():
    log(f"ACCEPTED [{request.method}] /model/create")
    req_data = request.get_json()
    req_data_format = {
        'model_name': req_constants.REQUIRED + req_constants.NON_EMPTY,
        'model_type': req_constants.REQUIRED + req_constants.NON_EMPTY,
        'model_type_extra': req_constants.REQUIRED + req_constants.NON_EMPTY
    }
    error_obj = route_helpers.validate_req_json(req_data, req_data_format)
    if error_obj is not None:
        return {'Error': error_obj}, 400
    # check to see if model already exists
    if os.path.isdir(config.MODEL_DIR / req_data['model_name']):
        return {'Error': 'Model already exists'}, 400
    ids = JobCreator().create(ModelCreationJob(req_data)).queue()
    return {'ids': ids}, 202


@app.route('/models', methods=['GET'])
def get_models_route():
    log(f"ACCEPTED [{request.method}] /models")
    rows = get_models()
    models = []
    for row in rows:
        model = {
            'id': row['id'],
            'model_name': row['model_name'],
            'model_type': row['model_type'],
            'model_type_extra': row['model_type_extra'],
            'date_created': row['date_created'],
            'date_last_accessed': row['date_last_accessed'],
            'model_status': row['model_status']
        }
        models.append(model)

    return {'models': models}, 200


@app.route('/model/<string:uuid>', methods=['GET'])
def get_model_route(uuid: str):
    log(f"ACCEPTED [{request.method}] /model/{uuid}")
    if len(uuid) != 32:
        return {'Error': "ID of model is of incorrect length"}, 400
    rows = get_model(uuid)
    if rows is None:
        return {'Error': "ID of model does not exist"}, 400
    for row in rows:
        return {
                   'id': row['id'],
                   'model_name': row['model_name'],
                   'model_type': row['model_type'],
                   'model_type_extra': row['model_type_extra'],
                   'date_created': row['date_created'],
                   'date_last_accessed': row['date_last_accessed'],
                   'model_status': row['model_status']
               }, 200


if __name__ == '__main__':
    app.run(host='localhost', port=8442, threaded=True)
