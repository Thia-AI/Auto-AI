import os
from overrides import overrides
import json

from job.base_job import BaseJob
from config import config
from db.commands.job_commands import update_job


class ModelCreationJob(BaseJob):
    def __init__(self, model_config: dict):
        super().__init__(model_config, job_name="Model Creation", initial_status="Creating Model Directory",
                         progress_max=2)

    @overrides
    def run(self):
        super().run()
        model_config = self.arg
        # Create model directory under models folder
        os.makedirs(config.MODEL_DIR / model_config["model_name"], exist_ok=True)
        super().set_status('Initializing Model Settings')
        super().set_progress(1)
        update_job(self)

        # Create settings.json with model_config
        with open (config.MODEL_DIR / model_config["model_name"] / 'model_settings.json', 'w', encoding='utf-8') as f:
            json.dump(model_config, f, ensure_ascii=False, indent=4, sort_keys=True)
        super().set_progress(2)
        super().clean_up_job()
