from flask import Flask
import os
os.environ['TF_CPP_MIN_LOG_LEVEL'] = '2'
import tensorflow as tf

app = Flask(__name__)

@app.route('/')
def hello_world():
    print(os.environ['PATH'])
    return str(tf.config.list_physical_devices())

if __name__ == '__main__':
    app.run(host='localhost', port=8442)