import os
from overrides import overrides
import json
import uuid
import subprocess

from job.base_job import BaseJob
from config import config
from db.commands.job_commands import update_job
from db.commands.model_commands import create_model as add_model_to_db


class ModelCreationJob(BaseJob):
    def __init__(self, model_config: dict):
        super().__init__(model_config, job_name="Model Creation", initial_status="Creating Model Directory",
                         progress_max=2)

    @overrides
    def run(self):
        super().run()
        model_config = self.arg
        model_config['id'] = uuid.uuid4().hex
        add_model_to_db(model_config['id'], model_config['model_name'], model_config['model_type'],
                        model_config['model_type_extra'], str(self.get_date_started()), str(self.get_date_started()))
        # Create model directory under models folder
        os.makedirs(config.MODEL_DIR / model_config["model_name"], exist_ok=True)
        super().set_status('Initializing Model Settings')
        super().set_progress(1)
        update_job(self)
        super().set_progress(2)
        super().clean_up_job()
