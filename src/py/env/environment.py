import sys 
import os
from pathlib import Path

from config import config


def init_environment() -> None:
    if getattr(sys, 'frozen', False) and hasattr(sys, '_MEIPASS'):
        config.bundle_dir = Path(sys._MEIPASS) # pylint: disable=no-member,protected-access
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
    
    print("ENV:", config.PRODUCTION)
    print("ENV:", config.DEVELOPMENT)