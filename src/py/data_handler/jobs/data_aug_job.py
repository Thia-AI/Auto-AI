import time
from typing import List
from overrides import overrides

from log.logger import log
from job.base_job import BaseJob
from db.commands.job_commands import update_job


class DataAugmentationJob(BaseJob):
    def __init__(self, files: List[str]):
        super().__init__(files, job_name="Data Augmentation", initial_status="Starting data augmentation job...", progress_max=len(files))

    @overrides
    def run(self):
        super().run()
        files = self.arg
        super().clean_up_job()
