from flask import Flask, jsonify, request

from env import environment

# First thing we do is initialize file paths, env variables, etc.
environment.init_environment_pre_gpu()

from data_handler.jobs.data_aug_job import DataAugmentationJob
from file_transfer.jobs.file_transfer_job import BulkFileTransferJob
from db.commands.job_commands import get_jobs, get_job
from job.job import JobCreator
from log.logger import log
from config import config

import tensorflow as tf

app = Flask(__name__)

environment.init_environment_post_gpu()


@app.route('/devices', methods=['GET'])
def get_devices_route():
    log(f"[{request.method}] /devices")
    out = []
    for device in tf.config.list_physical_devices():
        out.append({
            'name': device.name,
            'type': device.device_type
        })
    return jsonify(out)


@app.route('/train', methods=['POST'])
def train_route():
    log(f"[{request.method}] /train")
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
    log(f"[{request.method}] /jobs")
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
def get_job_route(uuid):
    log(f"[{request.method}] /jobs/{uuid}")
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


if __name__ == '__main__':
    app.run(host='localhost', port=8442, threaded=True)
