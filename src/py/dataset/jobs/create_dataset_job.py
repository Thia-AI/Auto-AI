import os
from overrides import overrides
import uuid

from job.base_job import BaseJob
from config import config
from db.commands.job_commands import update_job
from db.commands.dataset_commands import create_dataset


class CreateDatasetJob(BaseJob):
    def __init__(self, dataset_config: dict):
        super().__init__(dataset_config, job_name="Dataset Creation", initial_status="Creating Dataset Directory",
                         progress_max=1)

    @overrides
    def run(self):
        super().run()
        dataset_config = self.arg
        dataset_config['id'] = uuid.uuid4().hex
        create_dataset(dataset_config['id'], dataset_config['name'], dataset_config['type'], str(self.get_date_started()), str(self.get_date_started()), '')
        # Create dataset directory under datasets folder and other required folders
        os.makedirs(config.DATASET_DIR / dataset_config['name'], exist_ok=True)
        os.makedirs(config.DATASET_DIR / dataset_config['name'] / config.DATASET_INPUT_DIR_NAME, exist_ok=True)
        os.makedirs(config.DATASET_DIR / dataset_config['name'] / config.DATASET_LABEL_DIR_NAME, exist_ok=True)
        super().set_progress(1)
        update_job(self)

        super().clean_up_job()
