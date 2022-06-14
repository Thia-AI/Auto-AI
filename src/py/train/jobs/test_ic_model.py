import shutil
from abc import ABC
from multiprocessing import Process, Queue
from operator import itemgetter
from pathlib import Path
from typing import List, Tuple
from engineio.async_drivers import threading
import numpy as np
import tensorflow as tf
import tensorflow.keras
from PIL import Image
from overrides import overrides
from tensorflow.keras.models import load_model

from config import config as c
from config.constants import IC_MODEL_INPUT_SIZE
from job.base_job import BaseJob
from log.logger import log


class TestImageClassificationModelJob(BaseJob, ABC):
    def __init__(self, args: [Path, List[Path], str, dict, str]):
        # args: [temporary directory where images are stored, filenames of images to test, model name, model extra_data, model_type_extra]
        super().__init__(args, job_name='Image Classification Test', initial_status='Initialization',
                         progress_max=1)
        c.ENGINE_TEST_TASK_RUNNING = True
        self.test_process: Optional[Process] = None

    @overrides
    def exit(self):
        if self.test_process is not None:
            self.test_process.terminate()
        self.set_job_cancelled()
        # Remove temporary directory created
        shutil.rmtree(self.arg[0].absolute(), ignore_errors=True)
        super().exit()

    @overrides
    def run(self):
        super().run()
        temp_dir: Path = self.arg[0]
        filenames: List[Path] = self.arg[1]
        model_name: str = self.arg[2]
        model_extra_data: dict = self.arg[3]
        model_type_extra: str = self.arg[4]
        image_size: Tuple[int, int] = IC_MODEL_INPUT_SIZE[model_type_extra]
        try:
            image_batch = []
            for filename in filenames:
                with Image.open(filename) as img:
                    if img.format != 'JPEG':
                        img = img.convert('RGB')
                    img = img.resize(image_size, Image.NEAREST)
                    image_batch.append(np.asarray(img))
            image_batch: np.ndarray = np.array(image_batch)
            test_process_queue = Queue()
            test_data = {
                'image_batch': image_batch,
                'filenames': filenames,
                'model_dir': c.MODEL_DIR,
                'model_name': model_name,
                'model_extra_data': model_extra_data
            }
            test_process_queue.put(test_data)
            c.ENGINE_GPU_TASK_RUNNING = True
            self.test_process = Process(target=test_in_separate_process, args=(test_process_queue,))
            self.test_process.start()
            self.test_process.join()
            extra_data = itemgetter('extra_data')(test_process_queue.get())
            self.update_extra_data(extra_data)

            shutil.rmtree(temp_dir.absolute())
        except Exception:
            log('Removing test folder')
            shutil.rmtree(temp_dir.absolute())
        log('Testing Job Finished')
        self.set_progress(super().progress_max())
        c.ENGINE_TEST_TASK_RUNNING = False
        c.ENGINE_GPU_TASK_RUNNING = False
        super().clean_up_job()


def test_in_separate_process(queue: Queue):
    image_batch, filenames, model_dir, model_name, model_extra_data = itemgetter('image_batch', 'filenames', 'model_dir', 'model_name',
                                                                                 'model_extra_data')(queue.get())

    # Enable memory growth to prevent allocating all the GPU's memory
    gpus = tf.config.experimental.list_physical_devices('GPU')
    for gpu in gpus:
        tf.config.experimental.set_memory_growth(gpu, True)

    '''Uncomment below if you are testing the GPU running out of VRAM (ResourceExhausted Error)'''
    gpus = tf.config.experimental.list_physical_devices('GPU')
    try:
        tf.config.set_logical_device_configuration(gpus[0], [tf.config.LogicalDeviceConfiguration(memory_limit=48)])
    except RuntimeError as e:
        log(e)

    image_batch_tensor = tf.convert_to_tensor(image_batch)
    normalization_layer = tf.keras.layers.experimental.preprocessing.Rescaling(1. / 255)
    image_batch_tensor = normalization_layer(image_batch_tensor)
    model_path: Path = model_dir / model_name / c.MODEL_TRAINING_CHECKPOINT_DIR_NAME / c.MODEL_TRAINING_CHECKPOINT_NAME
    error = {}
    error_encountered = False
    predictions = []
    try:
        model: tensorflow.keras.Model = load_model(model_path.absolute())
        predictions = model(image_batch_tensor)
        predictions: np.ndarray = predictions.numpy()
        predictions = predictions.argmax(axis=1)
    except tf.errors.ResourceExhaustedError as e:
        error_encountered = True
        error = {
            'title': f"Resource Exhausted Testing '{model_name}'",
            'verboseMessage': 'Stop other GPU processes and/or reduce number of images being tested',
        }
    except tf.errors.InternalError as e:
        error_encountered = True
        error = {
            'title': f"Internal Error Encountered Testing '{model_name}'",
            'verboseMessage': 'Likely due to not enough VRAM. Stop other GPU processes and/or reduce number of images being tested',
        }
    except tf.errors.OpError as e:
        error_encountered = True
        error = {
            'title': f"Op Error Encountered Testing '{model_name}'",
            'verboseMessage': 'Try running test again',
        }
    except Exception as e:
        error_encountered = True
        error = {
            'title': f"Unknown Error Occurred Testing '{model_name}'",
            'verboseMessage': 'Some unknown error occurred during testing, try again',
        }

    if error_encountered:
        return_data = {'extra_data': {'error': error}}
    else:
        # No error during testing, continue...
        """
                labels_to_class_map is in the form of :{
                    'cat': 0,
                    'dog': 0,
                    'mouse': 0,
                    etc...
                }
            """
        labels_to_class_map = dict(model_extra_data['trained_model']['labels_to_class_map'])
        label_keys = list(labels_to_class_map.keys())
        label_values = list(labels_to_class_map.values())
        predictions_verbose = []
        for prediction in predictions:
            predictions_verbose.append(label_keys[label_values.index(prediction)])
        return_data = {'extra_data': {'predictions': predictions_verbose}}
    queue.put(return_data)
