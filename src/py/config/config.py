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