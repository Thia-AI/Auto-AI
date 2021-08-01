from typing import List
import tensorflow as tf
import os
from pathlib import Path
import shutil
import time
from overrides import overrides
import fnmatch
from datetime import datetime
import uuid

from job.base_job import BaseJob
from log.logger import log
from config import config
from db.commands.job_commands import update_job
from db.commands.dataset_commands import get_dataset
from db.commands.input_commands import add_images_to_db_batch


def add_input_to_values_list(values_list: List, input_id, dataset_id, file_name, label, date_created):
    values_list.append((input_id, dataset_id, file_name, label, date_created))


class BulkFileTransferJob(BaseJob):
    def __init__(self, files: (int, List[str])):
        # progress_max is 1 more than the length of files since we have 1 step for adding to DB
        super().__init__(files, job_name="Bulk File Transfer", initial_status="Starting Bulk File Transfer",
                         progress_max=len(files[1]) + 1)

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
        os.makedirs((config.DATASET_DIR / dataset['name'] / config.DATASET_INPUT_DIR_NAME).absolute(), exist_ok=True)
        num_files_in_input_dir = len(
            os.listdir((config.DATASET_DIR / dataset['name'] / config.DATASET_INPUT_DIR_NAME).absolute()))
        # Make input directory if it doesn't already exist
        values_to_add_to_inputs_table = []

        for i, file in enumerate(file_paths):
            file_p = Path(file)

            if tf.io.gfile.exists(file):
                try:
                    # If file_name already exists, we want to find the next numbered copy we can use
                    # For example, if cat.jpg already exists, we want to use cat (1).jpg, cat(2).jpg
                    # and so on

                    file_name = file_p.name
                    file_folder: Path = config.DATASET_DIR / dataset['name'] / config.DATASET_INPUT_DIR_NAME
                    file_path: Path = file_folder / file_name
                    i = 2
                    while tf.io.gfile.exists(file_path):
                        file_name = f"{file_p.stem} ({i}){file_p.suffix}"
                        file_path = file_folder / file_name
                        i += 1

                    # Copy the file fast with shutil
                    shutil.copyfile(file, file_path.absolute())
                    self.set_progress(i + 1)

                    # Append to values list
                    add_input_to_values_list(values_to_add_to_inputs_table, uuid.uuid4().hex, dataset_id, file_name,
                                             'unlabelled', datetime.now())

                    if time.time() - start_time >= amount_of_time_to_update_after:
                        update_job(self)
                        start_time = time.time()

                except IOError:
                    log(f"Copying File '{file_p.name}' failed")
            else:
                log(f"{file_p.name} does not exist")

        self.set_status("Updating DB Records")
        update_job(self)
        add_images_to_db_batch(values_to_add_to_inputs_table)

        super().clean_up_job()
