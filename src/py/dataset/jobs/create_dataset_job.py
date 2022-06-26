import os
import uuid

from overrides import overrides

from config import config
from db.commands.dataset_commands import create_dataset
from db.commands.job_commands import update_job
from decorators.verify_action import update_backend_action_completed
from job.base_job import BaseJob


class CreateDatasetJob(BaseJob):
    def __init__(self, dataset_config: [dict, str, str, str]):
        # args: req_data (or dataset_config), request_path, request_method, authorization_header
        super().__init__(dataset_config, job_name="Dataset Creation", initial_status="Creating Dataset Directory",
                         progress_max=1)

    @overrides
    def run(self):
        super().run()
        (dataset_config, request_path, request_method, authorization_header) = self.arg
        dataset_config['id'] = uuid.uuid4().hex
        create_dataset(dataset_config['id'], dataset_config['name'], dataset_config['type'], str(self.get_date_started()),
                       str(self.get_date_started()), '')
        # Create dataset directory under datasets folder and other required folders
        os.makedirs(config.DATASET_DIR / dataset_config['name'], exist_ok=True)
        os.makedirs(config.DATASET_DIR / dataset_config['name'] / config.DATASET_INPUT_DIR_NAME, exist_ok=True)
        os.makedirs(config.DATASET_DIR / dataset_config['name'] / config.DATASET_LABEL_DIR_NAME, exist_ok=True)
        super().set_progress(1)
        update_job(self)
        update_backend_action_completed({
            'path': request_path,
            'method': request_method,
            'name': dataset_config['name'],
            'type': dataset_config['type'],
            'dataset_id': dataset_config['id'],
            'date_created': self.get_date_started().astimezone().isoformat()
        }, auth_header=authorization_header)
        super().clean_up_job()
