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
        # Production
        config.bundle_dir = Path(sys._MEIPASS)  # pylint: disable=no-member,protected-access
        config.PRODUCTION = True
        config.DEVELOPMENT = False
        if len(sys.argv) > 1 and sys.argv[1] == 'simulated':
            """When Engine is ran in simulated mode during App development"""
            # Model
            config.MODEL_DIR = config.current_dir / 'src' / 'py' / config.MODEL_DIR_NAME
            # Dataset
            config.DATASET_DIR = config.current_dir / 'src' / 'py' / config.DATASET_DIR_NAME
            # Database
            config.DATABASE_LOCATION = config.current_dir / 'src' / 'py' / config.DATABASE_DIR_NAME / config.DATABASE_FILE_NAME
            # CUDA
            config.CUDA_PATH = config.current_dir / 'extraResources' / 'engine' / 'CUDA'
            # External dependencies
            config.EXTERNAL_DEPENDENCIES = config.current_dir / 'extraResources' / 'engine' / config.EXTERNAL_DEPENDENCIES_DIR_NAME
        else:
            """When Engine is ran in actual production environment"""
            # Model
            config.MODEL_DIR = config.current_dir / 'resources' / 'extraResources' / 'engine' / config.MODEL_DIR_NAME
            # Dataset
            config.DATASET_DIR = config.current_dir / 'resources' / 'extraResources' / 'engine' / config.DATASET_DIR_NAME
            # Database
            config.DATABASE_LOCATION = config.current_dir / 'resources' / 'extraResources' / 'engine' / config.DATABASE_DIR_NAME / config.DATABASE_FILE_NAME
            # CUDA
            config.CUDA_PATH = config.current_dir / 'resources' / 'extraResources' / 'engine' / 'CUDA'
            # External dependencies
            config.EXTERNAL_DEPENDENCIES = config.current_dir / 'resources' / 'extraResources' / 'engine' / config.EXTERNAL_DEPENDENCIES_DIR_NAME
    else:
        # Development
        config.bundle_dir = Path(__file__).parent
        config.PRODUCTION = False
        config.DEVELOPMENT = True
        if len(sys.argv) > 1 and sys.argv[1] == 'pycharm':
            """When Engine is ran in development mode via PyCharm"""
            # Model
            config.MODEL_DIR = config.current_dir / config.MODEL_DIR_NAME
            # Dataset
            config.DATASET_DIR = config.current_dir / config.DATASET_DIR_NAME
            # Database
            config.DATABASE_LOCATION = config.current_dir / config.DATABASE_DIR_NAME / config.DATABASE_FILE_NAME
            # CUDA
            config.CUDA_PATH = config.current_dir.absolute().parent.parent / 'CUDA'
            # External dependencies
            config.EXTERNAL_DEPENDENCIES = config.current_dir.absolute().parent.parent / config.EXTERNAL_DEPENDENCIES_DIR_NAME

        else:
            """When Engine is ran in development mode via App"""
            # Model
            config.MODEL_DIR = config.current_dir / 'src' / 'py' / config.MODEL_DIR_NAME
            # Dataset
            config.DATASET_DIR = config.current_dir / 'src' / 'py' / config.DATASET_DIR_NAME
            # Database
            config.DATABASE_LOCATION = config.current_dir / 'src' / 'py' / config.DATABASE_DIR_NAME / config.DATABASE_FILE_NAME
            # CUDA
            config.CUDA_PATH = config.current_dir.parent.parent.parent / 'CUDA'
            # External dependencies
            config.EXTERNAL_DEPENDENCIES = config.current_dir.parent.parent.parent / config.EXTERNAL_DEPENDENCIES_DIR_NAME

    # Set environment variables
    # CUDA
    add_path_to_path_env(config.CUDA_PATH)
    # External Dependencies
    config.ED_VIPS = config.EXTERNAL_DEPENDENCIES / config.ED_VIPS_DIR_NAME
    add_path_to_path_env(config.ED_VIPS)

    config.current_dir = Path.cwd() / config.bundle_dir
    msvcrt.setmode(sys.stdout.fileno(), os.O_BINARY)

    # Disable default logger that comes with flask
    os.environ['TF_CPP_MIN_LOG_LEVEL'] = '2'
    flask_logger = logging.getLogger('werkzeug')
    flask_logger.disabled = True


def add_path_to_path_env(path: Path):
    os.environ['PATH'] = str(path.absolute()) + os.pathsep + os.environ['PATH']


def init_environment_post_gpu():
    # Connect DBManager
    DBManager.get_instance()
    # Start the job manager
    JobManager.get_instance().start()
