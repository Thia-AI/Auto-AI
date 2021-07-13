import os
import shutil
from overrides import overrides
import uuid

from job.base_job import BaseJob
from config import config
from db.commands.job_commands import update_job
from db.commands.dataset_commands import get_dataset, delete_dataset


class DeleteDatasetJob(BaseJob):
    def __init__(self, dataset_id: str):
        super().__init__(dataset_id, job_name='Dataset Deletion', initial_status="Deleting Dataset", progress_max=2)

    @overrides
    def run(self):
        super().run()
        dataset_id = self.arg
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
        # Delete dataset from DB
        delete_dataset(dataset_id)
        super().set_progress(1)
        update_job(self)
        # Delete dataset folder
        shutil.rmtree(config.DATASET_DIR / dataset['name'], ignore_errors=True)
        super().set_progress(2)

        super().clean_up_job()

