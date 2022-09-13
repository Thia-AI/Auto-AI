import json
import logging
import msvcrt
import os
import sys
from pathlib import Path

from config import config
from db.database import DBManager
from job.job import JobManager
from log.logger import log


def init_common_env(environment) -> None:
    if getattr(sys, 'frozen', False) and hasattr(sys, '_MEIPASS'):
        # Production
        config.bundle_dir = Path(sys._MEIPASS)  # pylint: disable=no-member,protected-access
        if environment == 'simulated':
            """When Engine is ran in simulated mode during App development"""
            # CUDA
            config.CUDA_PATH = config.current_dir / 'extraResources' / 'engine' / 'CUDA'
            # External dependencies
            config.EXTERNAL_DEPENDENCIES = config.current_dir / 'extraResources' / 'engine' / config.EXTERNAL_DEPENDENCIES_DIR_NAME
        else:
            """When Engine is ran in actual production environment"""
            # CUDA
            config.CUDA_PATH = config.current_dir / 'resources' / 'extraResources' / 'engine' / 'CUDA'
            # External dependencies
            config.EXTERNAL_DEPENDENCIES = config.current_dir / 'resources' / 'extraResources' / 'engine' / config.EXTERNAL_DEPENDENCIES_DIR_NAME
    else:
        # Development
        config.bundle_dir = Path(__file__).parent
        if environment == 'pycharm':
            """When Engine is ran in development mode via PyCharm"""
            # CUDA
            config.CUDA_PATH = config.current_dir.absolute().parent.parent / 'CUDA'
            # External dependencies
            config.EXTERNAL_DEPENDENCIES = config.current_dir.absolute().parent.parent / config.EXTERNAL_DEPENDENCIES_DIR_NAME

        else:
            """When Engine is ran in development mode via App"""
            # CUDA
            config.CUDA_PATH = config.current_dir.parent.parent.parent / 'CUDA'
            # External dependencies
            config.EXTERNAL_DEPENDENCIES = config.current_dir.parent.parent.parent / config.EXTERNAL_DEPENDENCIES_DIR_NAME

    # Set environment variables
    # CUDA
    add_path_to_path_env(config.CUDA_PATH)
    # Set CUDA_DEVICE_ORDER so the IDs assigned by CUDA match those from nvidia-smi
    os.environ["CUDA_DEVICE_ORDER"] = "PCI_BUS_ID"
    # External Dependencies
    config.ED_VIPS = config.EXTERNAL_DEPENDENCIES / config.ED_VIPS_DIR_NAME
    add_path_to_path_env(config.ED_VIPS)


def init_environment_pre_gpu(args) -> None:
    config.USER_UID = args.user
    user_data = Path(args.user_data)
    if getattr(sys, 'frozen', False) and hasattr(sys, '_MEIPASS'):
        # Production
        config.bundle_dir = Path(sys._MEIPASS)  # pylint: disable=no-member,protected-access
        config.PRODUCTION = True
        config.DEVELOPMENT = False
        if args.environment == 'simulated':
            """When Engine is ran in simulated mode during App development"""
            # Model
            config.MODEL_CACHE = user_data / config.MODEL_CACHE_DIR_NAME
            config.MODEL_DIR = user_data / config.USERS_DIR_NAME / args.user / config.MODEL_DIR_NAME
            # Dataset
            config.DATASET_DIR = user_data / config.USERS_DIR_NAME / args.user / config.DATASET_DIR_NAME
            # Database
            config.DATABASE_LOCATION = user_data / config.USERS_DIR_NAME / args.user / config.DATABASE_DIR_NAME / config.DATABASE_FILE_NAME
        else:
            """When Engine is ran in actual production environment"""
            # Model
            config.MODEL_CACHE = user_data / config.MODEL_CACHE_DIR_NAME
            config.MODEL_DIR = user_data / config.USERS_DIR_NAME / args.user / config.MODEL_DIR_NAME
            # Dataset
            config.DATASET_DIR = user_data / config.USERS_DIR_NAME / args.user / config.DATASET_DIR_NAME
            # Database
            config.DATABASE_LOCATION = user_data / config.USERS_DIR_NAME / args.user / config.DATABASE_DIR_NAME / config.DATABASE_FILE_NAME
    else:
        # Development
        config.bundle_dir = Path(__file__).parent
        config.PRODUCTION = False
        config.DEVELOPMENT = True
        if args.environment == 'pycharm':
            """When Engine is ran in development mode via PyCharm"""
            # Model
            config.MODEL_CACHE = user_data / config.MODEL_CACHE_DIR_NAME
            config.MODEL_DIR = user_data / config.USERS_DIR_NAME / args.user / config.MODEL_DIR_NAME
            # Dataset
            config.DATASET_DIR = user_data / config.USERS_DIR_NAME / args.user / config.DATASET_DIR_NAME
            # Database
            config.DATABASE_LOCATION = user_data / config.USERS_DIR_NAME / args.user / config.DATABASE_DIR_NAME / config.DATABASE_FILE_NAME

        else:
            """When Engine is ran in development mode via App"""
            # Model
            config.MODEL_CACHE = user_data / config.MODEL_CACHE_DIR_NAME
            config.MODEL_DIR = user_data / config.USERS_DIR_NAME / args.user / config.MODEL_DIR_NAME
            # Dataset
            config.DATASET_DIR = user_data / config.USERS_DIR_NAME / args.user / config.DATASET_DIR_NAME
            # Database
            config.DATABASE_LOCATION = user_data / config.USERS_DIR_NAME / args.user / config.DATABASE_DIR_NAME / config.DATABASE_FILE_NAME

    config.current_dir = Path.cwd() / config.bundle_dir
    msvcrt.setmode(sys.stdout.fileno(), os.O_BINARY)

    # Disable default logger that comes with flask
    # os.environ['TF_CPP_MIN_LOG_LEVEL'] = '2'
    flask_logger = logging.getLogger('werkzeug')
    flask_logger.disabled = True


def add_path_to_path_env(path: Path):
    os.environ['PATH'] = str(path.absolute()) + os.pathsep + os.environ['PATH']


def init_environment_post_gpu():
    from tensorflow.python.client import device_lib

    def get_available_gpus():
        local_device_protos = device_lib.list_local_devices()
        return [{"VRAM": "" + str(x.memory_limit / 1024 / 1024) + " GB", "Description": x.physical_device_desc} for x in
                local_device_protos if x.device_type == 'GPU']

    log("Available GPUs: " + json.dumps(get_available_gpus(), indent=2), True)
    # Connect DBManager
    DBManager.get_instance()
    # Start the job manager
    JobManager.get_instance().start()
