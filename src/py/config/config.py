from pathlib import Path


PRODUCTION = False
DEVELOPMENT = False

"""Bundle and Current Dir"""
bundle_dir = Path('.')
current_dir = Path('.')

"""Model"""
# Model directory path
MODEL_DIR = Path('.')
# Model directory name
MODEL_DIR_NAME = 'models'

"""Datasets"""
# Dataset directory path
DATASET_DIR = Path('.')
# Dataset directory name
DATASET_DIR_NAME = 'datasets'

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