from typing import List
import tensorflow as tf
import os
from pathlib import Path
import shutil
import time
from overrides import overrides


from job.base_job import BaseJob
from log.logger import log
from config import config
from db.commands.job_commands import update_job


class BulkFileTransferJob(BaseJob):
    def __init__(self, files: List[str]):
        super().__init__(files, job_name="Bulk File Transfer", initial_status="Starting Bulk File Transfer", progress_max=len(files))

    @overrides
    def run(self):
        super().run()
        # update progress every 1s
        amount_of_time_to_update_after = 1
        # create model directory if not exists already
        os.makedirs(config.MODEL_DIR, exist_ok=True)
        start_time = time.time()
        for i, file in enumerate(self.arg):
            _, tail = os.path.split(file)
            if tf.io.gfile.exists(file):
                try:
                    shutil.copyfile(file, config.MODEL_DIR / tail)
                    self.set_progress(i+1)
                    if time.time() - start_time >= amount_of_time_to_update_after:
                        update_job(self)
                        start_time = time.time()
                except IOError as e:
                    log(f"Copying File '{tail}' failed")
            else:
                log(f"{tail} does not exist")
        super().clean_up_job()
