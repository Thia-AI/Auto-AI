import os
import shutil
import time
import uuid
from datetime import datetime
from pathlib import Path
from typing import List

import tensorflow as tf
from PIL import Image
from overrides import overrides

from config import config
from db.commands.dataset_commands import get_dataset, update_label_input_count, update_dataset_last_accessed
from db.commands.input_commands import add_images_to_db_batch
from db.commands.job_commands import update_job
from decorators.verify_action import update_backend_action_completed
from db.row_accessors import dataset_from_row
from job.base_job import BaseJob
from log.logger import log


def add_input_to_values_list(values_list: List, input_id, dataset_id, file_name, label, date_created):
    values_list.append((input_id, dataset_id, file_name, label, date_created))


class BulkFileTransferJob(BaseJob):
    def __init__(self, files: (int, List[str], str, str, str)):
        # progress_max is 1 more than the length of files since we have 1 step for adding to DB
        super().__init__(files, job_name="Bulk File Transfer", initial_status="Starting Bulk File Transfer",
                         progress_max=len(files[1]) + 1)

    @overrides
    def run(self):
        super().run()
        # update progress every 1s
        amount_of_time_to_update_after = 1
        start_time = time.time()
        (dataset_id, file_paths, request_path, request_method, authorization_header) = self.arg
        num_files_transferred = 0

        rows = get_dataset(dataset_id)
        dataset = {}

        for row in rows:
            dataset = dataset_from_row(row)
        # Make sure inputs directory exists
        os.makedirs((config.DATASET_DIR / dataset['name'] / config.DATASET_INPUT_DIR_NAME).absolute(), exist_ok=True)
        # Make input directory if it doesn't already exist
        values_to_add_to_inputs_table = []

        prev_datetime = datetime.now()

        for i, file in enumerate(file_paths):
            file_p = Path(file)

            if tf.io.gfile.exists(file):
                try:
                    # If file_name already exists, we want to find the next numbered copy we can use
                    # For example, if cat.jpg already exists, we want to use cat (1).jpg, cat(2).jpg
                    # and so on
                    file_stem = file_p.stem
                    file_name = f"{file_stem}.jpg"
                    file_folder: Path = config.DATASET_DIR / dataset['name'] / config.DATASET_INPUT_DIR_NAME
                    file_path: Path = file_folder / file_name
                    j = 1
                    while tf.io.gfile.exists(file_path):
                        file_name = f"{file_stem} ({j}).jpg"
                        file_path = file_folder / file_name
                        j += 1

                    # If original image was already a JPG file, just copy it
                    if file_p.suffix == '.jpg' or file_p.suffix == '.jpeg':
                        # Copy the file fast with shutil
                        shutil.copyfile(file, file_path.absolute())
                    else:
                        # Convert image to JPG, then save it
                        with Image.open(file) as img:
                            img = img.convert('RGB')
                            img.save(file_path)

                    num_files_transferred += 1
                    self.set_progress(i + 1)

                    # This is so that we end up with a unique datetime for each input
                    # (uniqueness is required since we use the timestamp in cursor based
                    # navigation)
                    curr_datetime = datetime.now()
                    while curr_datetime == prev_datetime:
                        curr_datetime = datetime.now()
                    # Append to values list
                    add_input_to_values_list(values_to_add_to_inputs_table, uuid.uuid4().hex, dataset_id, file_name,
                                             'unlabelled', curr_datetime)

                    if time.time() - start_time >= amount_of_time_to_update_after:
                        update_job(self)
                        start_time = time.time()

                    prev_datetime = curr_datetime

                except IOError:
                    log(f"Copying File '{file_p.name}' failed")
            else:
                log(f"{file_p.name} does not exist")
        update_label_input_count('unlabelled', dataset_id, 'rgb(1, 8, 20)')
        self.set_status("Updating DB Records")
        update_job(self)
        add_images_to_db_batch(values_to_add_to_inputs_table)
        update_dataset_last_accessed(dataset_id)
        self.set_progress(super().progress_max())
        update_backend_action_completed({
            'path': request_path,
            'method': request_method,
            'num_inputs_added': num_files_transferred
        }, auth_header=authorization_header)
        super().clean_up_job()
