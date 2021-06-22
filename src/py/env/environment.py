import sys
import os
from pathlib import Path
import msvcrt
import logging

from config import config
from log.logger import log
from job.job import JobManager
from db.database import DBManager


def init_environment_pre_gpu() -> None:
    if getattr(sys, 'frozen', False) and hasattr(sys, '_MEIPASS'):
        # production
        config.bundle_dir = Path(sys._MEIPASS)  # pylint: disable=no-member,protected-access
        config.PRODUCTION = True
        config.DEVELOPMENT = False
        # model
        config.MODEL_DIR = config.current_dir / config.MODEL_DIR_NAME
        if len(sys.argv) > 1 and sys.argv[1] == 'simulated':
            """When Engine is ran in simulated mode during App development"""
            # model
            config.MODEL_DIR = config.current_dir / 'src' / 'py' / config.MODEL_DIR_NAME
            # dataset
            config.DATASET_DIR = config.current_dir / 'src' / 'py' / config.DATASET_DIR_NAME
            # database
            config.DATABASE_LOCATION = config.current_dir / 'src' / 'py' / config.DATABASE_DIR_NAME / config.DATABASE_FILE_NAME
            # cuda
            config.CUDA_PATH = config.current_dir / 'extraResources' / 'engine' / 'CUDA'
            log(f"Simulated Prod - {str(config.CUDA_PATH.absolute())}")
        else:
            """When Engine is ran in actual production environment"""
            # model
            config.MODEL_DIR = config.current_dir / 'resources' / 'extraResources' / 'engine' / config.MODEL_DIR_NAME
            # dataset
            config.DATASET_DIR = config.current_dir / 'resources' / 'extraResources' / 'engine' / config.DATASET_DIR_NAME
            # database
            config.DATABASE_LOCATION = config.current_dir / 'resources' / 'extraResources' / 'engine' / config.DATABASE_DIR_NAME / config.DATABASE_FILE_NAME
            # cuda
            config.CUDA_PATH = config.current_dir / 'resources' / 'extraResources' / 'engine' / 'CUDA'

    else:
        # development
        config.bundle_dir = Path(__file__).parent
        config.PRODUCTION = False
        config.DEVELOPMENT = True
        if len(sys.argv) > 1 and sys.argv[1] == 'pycharm':
            """When Engine is ran in development mode via PyCharm"""
            # model related
            config.MODEL_DIR = config.current_dir / config.MODEL_DIR_NAME
            # dataset
            config.DATASET_DIR = config.current_dir / config.DATASET_DIR_NAME
            # database
            config.DATABASE_LOCATION = config.current_dir / config.DATABASE_DIR_NAME / config.DATABASE_FILE_NAME
            # cuda
            config.CUDA_PATH = config.current_dir.absolute().parent.parent / 'CUDA'
            log(f"Pycharm - {str(config.CUDA_PATH.absolute())}")
        else:
            """When Engine is ran in development mode via App"""
            # model
            config.MODEL_DIR = config.current_dir / 'src' / 'py' / config.MODEL_DIR_NAME
            # dataset
            config.DATASET_DIR = config.current_dir / 'src' / 'py' / config.DATASET_DIR_NAME
            # database
            config.DATABASE_LOCATION = config.current_dir / 'src' / 'py' / config.DATABASE_DIR_NAME / config.DATABASE_FILE_NAME
            # cuda
            config.CUDA_PATH = config.current_dir.parent.parent.parent / 'CUDA'
            log(f"App - {str(config.CUDA_PATH.absolute())}")

    # cuda
    os.environ['PATH'] = str(config.CUDA_PATH.absolute()) + os.pathsep + os.environ['PATH']

    config.current_dir = Path.cwd() / config.bundle_dir
    msvcrt.setmode(sys.stdout.fileno(), os.O_BINARY)

    # Disable default logger that comes with flask
    os.environ['TF_CPP_MIN_LOG_LEVEL'] = '2'
    flask_logger = logging.getLogger('werkzeug')
    flask_logger.disabled = True


def init_environment_post_gpu():
    # Connect DBManager
    DBManager.get_instance()
    # Start the job manager
    JobManager.get_instance().start()
