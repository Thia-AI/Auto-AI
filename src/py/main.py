import os
import sys
from flask import Flask, jsonify, request
from log.logger import log
import logging

from config import config
from env import environment

# from env import environment

environment.init_environment()

import tensorflow as tf

app = Flask(__name__)
# Disable default logger that comes with flask
flaskLogger = logging.getLogger('werkzeug')
flaskLogger.disabled = True


@app.route('/getDevices', methods=['GET'])
def hello_world():
    log("Received Request")
    out = []
    for device in tf.config.list_physical_devices():
        out.append({
            'name': device.name,
            'type': device.device_type
        })
    return jsonify(out)


@app.route('/test_data', methods=['POST'])
def train():
    if request.method == 'POST':
        log("POSTed")
    return {'retard': 200}, 200


if __name__ == '__main__':
    app.run(host='localhost', port=8442, threaded=True)
