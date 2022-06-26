import os
import uuid

from overrides import overrides

from config import config
from config.constants import ICModelStatus
from db.commands.job_commands import update_job
from db.commands.model_commands import create_model as add_model_to_db
from decorators.verify_action import update_backend_action_completed
from job.base_job import BaseJob


class ModelCreationJob(BaseJob):
    def __init__(self, args: [dict, str, str, str]):
        # args: req_data (or model_config), request_path, request_method, authorization_header
        super().__init__(args, job_name="Model Creation", initial_status="Creating Model Directory",
                         progress_max=2)

    @overrides
    def run(self):
        super().run()
        (model_config, request_path, request_method, authorization_header) = self.arg
        model_config['id'] = uuid.uuid4().hex
        add_model_to_db(model_config['id'], model_config['model_name'], model_config['model_type'],
                        model_config['model_type_extra'], str(self.get_date_started()), str(self.get_date_started()),
                        model_config['labelling_type'])
        # Create model directory under models folder
        os.makedirs(config.MODEL_DIR / model_config["model_name"], exist_ok=True)
        super().set_status('Initializing Model Settings')
        super().set_progress(1)
        update_job(self)
        super().set_progress(2)
        update_backend_action_completed({
            'path': request_path,
            'method': request_method,
            'model_name': model_config['model_name'],
            'model_type': model_config['model_type'],
            'model_type_extra': model_config['model_type_extra'],
            'labelling_type': model_config['labelling_type'],
            'model_id': model_config['id'],
            'model_status': ICModelStatus.IDLE.value,
            'date_created': self.get_date_started().astimezone().isoformat()
        }, auth_header=authorization_header)
        super().clean_up_job()
