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
from db.commands.dataset_commands import get_dataset


class BulkFileTransferJob(BaseJob):
    def __init__(self, files: (int, List[str])):
        super().__init__(files, job_name="Bulk File Transfer", initial_status="Starting Bulk File Transfer", progress_max=len(files))

    @overrides
    def run(self):
        super().run()
        # update progress every 1s
        amount_of_time_to_update_after = 1
        start_time = time.time()
        (dataset_id, file_paths) = self.arg
        rows = get_dataset(dataset_id)
        dataset = {}
        for row in rows:
            dataset = {
                'id': row['id'],
                'name': row['name'],
                'type': row['type'],
                'date_created': row['date_created'],
                'date_last_accessed': row['date_last_accessed'],
                'misc_data': row['misc_data']
            }
        # Make input directory if it doesn't already exist
        os.makedirs((config.DATASET_DIR / dataset['name'] / config.DATASET_INPUT_DIR_NAME).absolute(), exist_ok=True)
        for i, file in enumerate(file_paths):
            _, tail = os.path.split(file)
            if tf.io.gfile.exists(file):
                try:
                    shutil.copyfile(file, (config.DATASET_DIR / dataset['name'] / config.DATASET_INPUT_DIR_NAME / tail).absolute())
                    self.set_progress(i+1)
                    if time.time() - start_time >= amount_of_time_to_update_after:
                        update_job(self)
                        start_time = time.time()
                except IOError as e:
                    log(f"Copying File '{tail}' failed")
            else:
                log(f"{tail} does not exist")
        super().clean_up_job()
