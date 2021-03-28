import os
import sys
from flask import Flask

from config import config
from env import environment
# from env import environment

environment.init_environment()

import tensorflow as tf

print("MAIN:", config.PRODUCTION)
print("MAIN:", config.DEVELOPMENT)

app = Flask(__name__)


@app.route('/')
def hello_world():
    # print(os.environ['PATH'])
    return str(tf.config.list_physical_devices())


if __name__ == '__main__':
    app.run(host='localhost', port=8442)
