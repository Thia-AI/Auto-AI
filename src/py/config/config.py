from pathlib import Path

PRODUCTION = False
DEVELOPMENT = False

"""Bundle and Current Dir"""
bundle_dir = Path('.')
current_dir = Path('.')

"""Model"""
# Model Cache path
MODEL_CACHE = Path('.')
# Model directory name
MODEL_CACHE_DIR_NAME = 'models_cache'
# Model directory path
MODEL_DIR = Path('.')
# Model directory name
MODEL_DIR_NAME = 'models'
# Training checkpoint directory name
MODEL_TRAINING_CHECKPOINT_DIR_NAME = 'training_checkpoints'
# Training checkpoint name
MODEL_TRAINING_CHECKPOINT_NAME = 'checkpoint'
# Extra data file only available during training time
MODEL_TRAINING_TIME_EXTRA_DATA_NAME = 'extra_data.json'

"""Datasets"""
# Dataset directory path
DATASET_DIR = Path('.')
# Dataset directory name
DATASET_DIR_NAME = 'datasets'
# Directory for inputs
DATASET_INPUT_DIR_NAME = 'input'
# Directory for labels
DATASET_LABEL_DIR_NAME = 'labels'

"""Database"""
# DB path
DATABASE_LOCATION = Path('.')
# DB directory name
DATABASE_DIR_NAME = 'cache'
# DB file name
DATABASE_FILE_NAME = 'engine.db'

"""CUDA"""
# CUDA directory path
CUDA_PATH = Path('.')

"""External Dependencies"""
# External Dependencies directory name
EXTERNAL_DEPENDENCIES = Path('.')
EXTERNAL_DEPENDENCIES_DIR_NAME = 'external_dependencies'
# All external libraries' directories go here, prefixed by 'ED' (External Dependency)
# libvips version 8.1.1
ED_VIPS = Path('.')
ED_VIPS_DIR_NAME = 'vips'

"""Engine Runtime Config"""
ENGINE_GPU_TASK_RUNNING = False
ENGINE_TEST_TASK_RUNNING = False
ENGINE_BATCH_LABELLING_RUNNING = False
