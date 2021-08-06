import os
import shutil
from overrides import overrides
import uuid

from job.base_job import BaseJob
from config import config
from db.commands.job_commands import update_job
from db.commands.dataset_commands import get_dataset, delete_dataset
from db.commands.input_commands import delete_all_inputs_of_dataset
from db.row_accessors import dataset_from_row


class DeleteDatasetJob(BaseJob):
    def __init__(self, dataset_id: str):
        super().__init__(dataset_id, job_name='Dataset Deletion', initial_status="Deleting Dataset", progress_max=3)

    @overrides
    def run(self):
        super().run()
        dataset_id = self.arg
        rows = get_dataset(dataset_id)
        dataset = {}
        for row in rows:
            dataset = dataset_from_row(row)
        # Delete dataset from DB
        delete_dataset(dataset_id)
        super().set_progress(1)
        update_job(self)
        # Delete dataset folder
        shutil.rmtree(config.DATASET_DIR / dataset['name'], ignore_errors=True)
        super().set_progress(2)
        update_job(self)
        # Delete all inputs of dataset from DB
        delete_all_inputs_of_dataset(dataset_id)
        super().set_progress(3)

        super().clean_up_job()

