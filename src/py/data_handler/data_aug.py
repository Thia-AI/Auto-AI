import time
from typing import List
from overrides import overrides

from log.logger import log
from job.base_job import BaseJob
from db.commands.job_commands import update_job


class DataAugmentationJob(BaseJob):
    def __init__(self, files: List[str]):
        super().__init__(files, job_name="Data Augmentation", initial_status="Starting data augmentation job...")

    @overrides
    def run(self):
        super().run()
        files = self.arg
        log(str(len(files)))
        super().clean_up_job()
        self.set_status("Done")
        update_job(self)
