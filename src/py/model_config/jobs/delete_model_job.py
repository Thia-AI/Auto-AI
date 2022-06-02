import os
import shutil
import stat

from overrides import overrides

from config import config
from db.commands.job_commands import update_job
from db.commands.model_commands import delete_model
from job.base_job import BaseJob
from log.logger import log


def del_rw(action, name, exc):
    """shutil.rmtree backup onerror function that removes a directory the slower way"""
    os.chmod(name, stat.S_IWRITE)
    os.remove(name)


class ModelDeletionJob(BaseJob):
    def __init__(self, model_row: dict):
        super().__init__(model_row, job_name="Model Deletion", initial_status="Deleting Model Directory",
                         progress_max=2)

    @overrides
    def run(self):
        super().run()
        model = self.arg
        model_dir = config.MODEL_DIR / model['model_name']
        log(model_dir.absolute())
        shutil.rmtree(str(model_dir.absolute()), ignore_errors=False, onerror=del_rw)
        super().set_status("Updating DB")
        super().set_progress(1)
        update_job(self)
        delete_model(model['id'])
        super().clean_up_job()
