import os
import sys
from flask import Flask, jsonify

from config import config
from env import environment

# from env import environment

environment.init_environment()

import tensorflow as tf

print("MAIN:", config.PRODUCTION)
print("MAIN:", config.DEVELOPMENT)

app = Flask(__name__)


@app.route('/getDevices', methods=['GET'])
def hello_world():
    print('Received Request', flush=True)
    out = []
    for device in tf.config.list_physical_devices():
        out.append({
            'name': device.name,
            'type': device.device_type
        })
    return jsonify(out)

if __name__ == '__main__':
    app.run(host='localhost', port=8442)
