import sys
import os
from pathlib import Path
import msvcrt
import logging

from config import config
from log.logger import log
from job.job import JobManager
from db.database import DBManager


def init_environment() -> None:
    if getattr(sys, 'frozen', False) and hasattr(sys, '_MEIPASS'):
        config.bundle_dir = Path(sys._MEIPASS)  # pylint: disable=no-member,protected-access
        config.PRODUCTION = True
        config.DEVELOPMENT = False
    else:
        config.bundle_dir = Path(__file__).parent
        config.PRODUCTION = False
        config.DEVELOPMENT = True
    config.current_dir = Path.cwd() / config.bundle_dir

    os.environ['TF_CPP_MIN_LOG_LEVEL'] = '2'

    if config.DEVELOPMENT:
        os.environ['PATH'] = str(config.current_dir.parent.parent.parent / 'CUDA') + os.pathsep + os.environ['PATH']
    else:
        os.environ['PATH'] = str(config.current_dir / 'CUDA') + os.pathsep + os.environ['PATH']

    msvcrt.setmode(sys.stdout.fileno(), os.O_BINARY)
    log(f"ENV: {config.PRODUCTION}")
    log(f"ENV: {config.DEVELOPMENT}")

    # Disable default logger that comes with flask
    flask_logger = logging.getLogger('werkzeug')
    flask_logger.disabled = True

    # Connect DBManager
    DBManager.get_instance()
    # Start the job manager
    JobManager.get_instance().start()
