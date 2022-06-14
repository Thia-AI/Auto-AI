import functools
import json
from collections import defaultdict
from multiprocessing import Process, Queue
from operator import itemgetter
from pathlib import Path
from typing import Tuple

import numpy as np
import tensorflow as tf
from overrides import overrides
from tensorflow.keras import preprocessing, layers, models, backend, optimizers, losses, callbacks, metrics

from config import config as c
from config import constants
from config.constants import ICModelStatus, ICTrainJobStatus
from db.commands.dataset_commands import get_dataset, get_labels
from db.commands.input_commands import get_train_data_from_all_inputs
from db.commands.model_commands import get_model, update_model_status, update_model_extra_data
from db.row_accessors import dataset_from_row, model_from_row, label_from_row
from job.base_job import BaseJob
from log.logger import log
from train import effnetv2_model


class TrainImageClassifierJob(BaseJob):
    def __init__(self, args: [str, str]):
        super().__init__(args, job_name='Image Classification Training', initial_status='Initialization',
                         progress_max=1)

    @overrides
    def run(self):
        super().run()
        # Extra data update here for training initialization
        extra_data = {
            'status': ICTrainJobStatus.STARTING_TRAINING.value
        }
        self.update_extra_data(extra_data)

        (model_id, dataset_id) = self.arg
        rows = get_model(model_id)
        model = {}
        for row in rows:
            model = model_from_row(row)
        # TODO: Check here if already training and exit if so.
        # Extra data update here, so that we can get the train-time extra_data.json location
        # in get_train_job route.
        extra_data = {
            'model_id': model_id,
            'model_name': model['model_name']
        }
        self.update_extra_data(extra_data)

        rows = get_dataset(dataset_id)
        dataset = {}
        for row in rows:
            dataset = dataset_from_row(row)
        label_rows = get_labels(dataset_id)
        label_to_class_map = {}
        num_classes = 0
        for row in label_rows:
            label = label_from_row(row)
            if label['value'] == constants.DATASET_UNLABELLED_LABEL:
                continue
            label_to_class_map[label['value']] = num_classes
            num_classes += 1

        inputs: np.ndarray = get_train_data_from_all_inputs(dataset_id)

        def make_input_path(file_name: str):
            return str((c.DATASET_DIR / dataset['name'] / c.DATASET_INPUT_DIR_NAME / file_name).absolute())

        def make_input_label(label_value: str):
            return label_to_class_map[label_value]

        inputs = np.array([[make_input_path(i[0]), make_input_label(i[1])] for i in inputs])

        train_process_queue = Queue()
        train_data = {
            'job_id': self.id(),
            'num_classes': num_classes,
            'inputs': inputs,
            'model_cache_path': c.MODEL_CACHE,
            'model_dir': c.MODEL_DIR,
            'model_name': model['model_name'],
            'model_type': model['model_type_extra'],
            'current_extra_data': self.extra_data()
        }
        train_process_queue.put(train_data)
        update_model_status(model_id, ICModelStatus.TRAINING)
        p = Process(target=train_in_separate_process, args=(train_process_queue,))
        p.start()
        p.join()

        job_updater_json_filepath: Path = c.MODEL_DIR / model['model_name'] / c.MODEL_TRAINING_TIME_EXTRA_DATA_NAME

        if job_updater_json_filepath.is_file():
            # Get extra_data from the file itself
            job_updater_json_file = open(job_updater_json_filepath.absolute())
            try:
                extra_data = json.load(job_updater_json_file)
                self.update_extra_data(extra_data)
                job_updater_json_file.close()
                job_updater_json_filepath.unlink()
            except Exception as e:
                log(str(e))

        # Get latest model data and update it's extra_data with a trained labels map
        rows = get_model(model_id)
        model = {}
        for row in rows:
            model = model_from_row(row)
        if model['extra_data'] is not None:
            current_model_extra_data = dict(model['extra_data'])
        else:
            current_model_extra_data = dict()
        # Get labels trained on
        labels_trained_on = {}
        for row in label_rows:
            label = label_from_row(row)
            if label['value'] == constants.DATASET_UNLABELLED_LABEL:
                continue
            labels_trained_on[label['value']] = label

        if self.extra_data()['error'] is not None:
            # There was an error during training
            update_model_status(model_id, ICModelStatus.ERROR)
            current_model_extra_data.update({'trained_model': {
                'labels_to_class_map': label_to_class_map,
                'labels_trained_on': labels_trained_on,
                'error': self.extra_data()['error']
            }})
            extra_data = {
                'status_description': 'Error Encountered During Training, Try Again',
                'status': ICTrainJobStatus.ERROR.value
            }
        else:
            update_model_status(model_id, ICModelStatus.TRAINED)
            current_model_extra_data.update({'trained_model': {
                'labels_to_class_map': label_to_class_map,
                'labels_trained_on': labels_trained_on
            }})
            extra_data = {
                'status_description': 'Cleaned up',
                'status': ICTrainJobStatus.EVALUATED.value
            }
        update_model_extra_data(model_id, current_model_extra_data)

        self.update_extra_data(extra_data)
        log('Training Job Finished')
        self.set_progress(super().progress_max())
        super().clean_up_job()


def update_local_extra_data(data_to_update: dict, extra_data: dict, file: tf.io.gfile.GFile):
    extra_data.update(data_to_update)
    with file as f:
        json.dump(extra_data, f)


def train_in_separate_process(queue: Queue):
    job_id, num_classes, inputs, model_cache_path, model_dir, model_name, model_type, current_extra_data = itemgetter('job_id',
                                                                                                                      'num_classes', 'inputs',
                                                                                                                      'model_cache_path',
                                                                                                                      'model_dir',
                                                                                                                      'model_name',
                                                                                                                      'model_type',
                                                                                                                      'current_extra_data')(
        queue.get())

    job_updater_json_filepath: Path = model_dir / model_name / c.MODEL_TRAINING_TIME_EXTRA_DATA_NAME
    seed = np.random.randint(1e6)
    rng = np.random.RandomState(seed)
    rng.shuffle(inputs)
    NUM_IMAGES = len(inputs)
    PERFORM_DATA_AUG = False
    interpolation = tf.image.ResizeMethod.BILINEAR
    IMAGE_SIZE: Tuple[int, int] = constants.IC_MODEL_INPUT_SIZE[model_type]
    BATCH_SIZE = 32
    effnet_model_name = constants.IC_MODEL_TYPE_TO_EFFICIENTNET_MAP[model_type]
    TRAIN_SPLIT = 0.8
    current_extra_data = dict(current_extra_data)
    extra_data_file = tf.io.gfile.GFile(job_updater_json_filepath.absolute(), 'w')
    update_extra_data = functools.partial(update_local_extra_data, extra_data=current_extra_data, file=extra_data_file)
    update_extra_data({'status_description': 'Initializing devices'})
    error_encountered_during_training = False

    # Enable memory growth to prevent allocating all of the GPU's memory

    try:
        gpus = tf.config.experimental.list_physical_devices('GPU')
        for gpu in gpus:
            tf.config.experimental.set_memory_growth(gpu, True)

        '''Uncomment below if you are testing the GPU running out of VRAM (ResourceExhausted Error)'''

        # gpus = tf.config.experimental.list_physical_devices('GPU')
        # try:
        #     tf.config.set_logical_device_configuration(gpus[0], [tf.config.LogicalDeviceConfiguration(memory_limit=1024)])
        # except RuntimeError as e:
        #     log(e)

        def load_image(path, image_size, num_channels, interpolation, crop_to_aspect_ratio=False):
            """Load an image from a path and resize it."""
            try:
                img = tf.io.read_file(path)
                img = tf.io.decode_image(img, channels=num_channels, expand_animations=False)
                if crop_to_aspect_ratio:
                    preprocessing.image.smart_resize(img, image_size, interpolation=interpolation)
                else:
                    img = tf.image.resize(img, image_size, method=interpolation)
                return img
            except Exception:
                pass

        def set_image_shape(image, image_size, num_channels):
            image.set_shape((image_size[0], image_size[1], num_channels))
            return image

        update_extra_data({'status_description': 'Creating dataset'})
        train_x_paths = inputs[:int(TRAIN_SPLIT * NUM_IMAGES), 0]
        train_y = inputs[:int(TRAIN_SPLIT * NUM_IMAGES), 1].astype(np.int)

        val_x_paths = inputs[int(TRAIN_SPLIT * NUM_IMAGES):, 0]
        val_y = inputs[int(TRAIN_SPLIT * NUM_IMAGES):, 1].astype(np.int)

        train_ds_x = tf.data.Dataset.from_tensor_slices(train_x_paths)
        TRAIN_SIZE = train_ds_x.cardinality().numpy()
        train_ds_x = train_ds_x.map(
            lambda x: tf.py_function(func=load_image, inp=[x, IMAGE_SIZE, 3, interpolation, error_encountered_during_training],
                                     Tout=tf.float32))
        # tf.py_function has issues with setting shape, so we need to do it outside of one
        train_ds_x = train_ds_x.map(lambda x: set_image_shape(x, IMAGE_SIZE, 3))

        train_ds_y = tf.data.Dataset.from_tensor_slices(train_y)
        train_ds_y = train_ds_y.map(lambda x: tf.one_hot(x, num_classes))

        val_ds_x = tf.data.Dataset.from_tensor_slices(val_x_paths)
        VALIDATION_SIZE = val_ds_x.cardinality().numpy()
        val_ds_x = val_ds_x.map(
            lambda x: tf.py_function(func=load_image, inp=[x, IMAGE_SIZE, 3, interpolation, error_encountered_during_training], Tout=tf.float32))
        # tf.py_function has issues with setting shape, so we need to do it outside of one
        val_ds_x = val_ds_x.map(lambda x: set_image_shape(x, IMAGE_SIZE, 3))

        val_ds_y = tf.data.Dataset.from_tensor_slices(val_y)
        val_ds_y = val_ds_y.map(lambda x: tf.one_hot(x, num_classes))

        train_ds = tf.data.Dataset.zip((train_ds_x, train_ds_y)).batch(BATCH_SIZE)
        # Repeat training dataset since we will be doing data augmentation to it only
        train_ds = train_ds.repeat()
        val_ds = tf.data.Dataset.zip((val_ds_x, val_ds_y)).batch(BATCH_SIZE)

        # Perform normalization & data augmentation
        normalization_layer = layers.experimental.preprocessing.Rescaling(1. / 255)
        preprocessing_model = models.Sequential([normalization_layer])

        if PERFORM_DATA_AUG:
            preprocessing_model.add(layers.experimental.preprocessing.RandomRotation(70))
            preprocessing_model.add(layers.experimental.preprocessing.RandomFlip('horizontal_and_vertical'))

        train_ds = train_ds.map(lambda temp_images, temp_labels: (preprocessing_model(temp_images), temp_labels)).prefetch(tf.data.AUTOTUNE)
        val_ds = val_ds.map(lambda temp_images, temp_labels: (normalization_layer(temp_images), temp_labels)).prefetch(tf.data.AUTOTUNE)

        update_extra_data({'status_description': 'Building model'})
        model = models.Sequential([
            layers.InputLayer(input_shape=IMAGE_SIZE + (3,)),
            effnetv2_model.get_model(effnet_model_name, save_path=model_cache_path, include_top=False),
            layers.Dropout(rate=0.2),
            layers.Dense(2, activation='softmax')
        ])

        model.build((None,) + IMAGE_SIZE + (3,))
        model.summary()

        METRICS = [
            metrics.BinaryAccuracy(name='accuracy'),
            metrics.Precision(name='precision'),
            metrics.Recall(name='recall'),
            metrics.AUC(name='auc'),
            metrics.AUC(name='prc', curve='PR'),
        ]

        model.compile(optimizer=optimizers.Adam(), loss=losses.CategoricalCrossentropy(label_smoothing=0.1), metrics=METRICS)

        steps_per_epoch = TRAIN_SIZE // BATCH_SIZE
        validation_steps = VALIDATION_SIZE // BATCH_SIZE

        class JobUpdater(callbacks.Callback):
            """Callback that updates the `extra_data` column for the training job."""

            def __init__(self, extra_data, filepath: Path):
                self.json_file = tf.io.gfile.GFile('')
                self.metrics = None
                self.history = defaultdict(list)
                self.extra_data = dict(extra_data)
                self.filepath = filepath
                super(JobUpdater, self).__init__()

            def on_train_begin(self, logs=None):
                self.json_file = tf.io.gfile.GFile(self.filepath.absolute(), 'w')
                self.extra_data.update({'status': ICTrainJobStatus.TRAINING.value, 'status_description': 'Fitting model'})
                # Save that training has started
                with self.json_file as f:
                    json.dump(self.extra_data, f)

            def on_epoch_end(self, epoch, logs=None):
                logs = logs or {}

                if self.metrics is None:
                    self.metrics = sorted(logs.keys())

                for key in self.metrics:
                    self.history[key].append(logs[key])
                self.extra_data.update({'history': self.history})
                # Save to file
                with self.json_file as f:
                    json.dump(self.extra_data, f)

        cp_callback_filepath: Path = model_dir / model_name / c.MODEL_TRAINING_CHECKPOINT_DIR_NAME / c.MODEL_TRAINING_CHECKPOINT_NAME
        cp_callback = callbacks.ModelCheckpoint(filepath=cp_callback_filepath.absolute(), monitor='val_loss', mode='min', save_best_only=True)
        early_stopping = callbacks.EarlyStopping(monitor='val_loss', patience=5, restore_best_weights=True)

        job_updater = JobUpdater(current_extra_data, job_updater_json_filepath)

        CALLBACKS = [
            job_updater,
            cp_callback,
            early_stopping
        ]
        hist: callbacks.History = model.fit(train_ds, epochs=1000, steps_per_epoch=steps_per_epoch, validation_data=val_ds,
                                            validation_steps=validation_steps,
                                            callbacks=CALLBACKS, verbose=2)
    except tf.errors.ResourceExhaustedError as e:
        # Resource exhausted, usually an OOM error
        update_extra_data({
            'status_description': 'Error encountered during training',
            'error': {
                'title': f"Resource Exhausted Training '{model_name}'",
                'verboseMessage': 'Model may be too largess to train on your GPU',
            }
        })
        error_encountered_during_training = True
    except tf.errors.OpError as e:
        # Another tensorflow error
        update_extra_data({
            'status_description': 'Error encountered during training',
            'error': {
                'title': f"Op Error Encountered Training '{model_name}'",
                'verboseMessage': 'Try training again',
            }
        })
        error_encountered_during_training = True
    except Exception as e:
        update_extra_data({
            'status_description': 'Error encountered during training',
            'error': {
                'title': f"Error Encountered Training '{model_name}'",
                'verboseMessage': 'Try training again',
            }
        })
        error_encountered_during_training = True

    if not error_encountered_during_training:
        # No error encountered, continue evaluating trained model
        update_extra_data({'status_description': 'Evaluating model', 'status': ICTrainJobStatus.EVALUATING.value, 'history': hist.history})
        log('Evaluating model')
        evaluation = model.evaluate(val_ds, verbose=1)
        metric_names = model.metrics_names
        evaluation_result = {}
        for i, metric in enumerate(metric_names):
            evaluation_result[metric] = evaluation[i]
        update_extra_data({'status_description': 'Cleaning up', 'evaluation_result': evaluation_result})
    else:
        # Error encountered during training, don't evaluate model
        update_extra_data({'status_description': 'Cleaning up', 'status': ICTrainJobStatus.ERROR.value})
    backend.clear_session()
