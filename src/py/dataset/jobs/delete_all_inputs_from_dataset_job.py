import os
import shutil

from overrides import overrides

from config import config
from db.commands.dataset_commands import get_dataset
from db.commands.input_commands import delete_all_inputs_of_dataset
from db.commands.job_commands import update_job
from job.base_job import BaseJob
from db.row_accessors import dataset_from_row


class DeleteAllInputsFromDatasetJob(BaseJob):
    def __init__(self, dataset_id: str):
        super().__init__(dataset_id, job_name='Delete All Inputs From Dataset', initial_status="Deleting Inputs From Storage",
                         progress_max=2)

    @overrides
    def run(self):
        super().run()
        dataset_id = self.arg
        rows = get_dataset(dataset_id)
        dataset = {}
        for row in rows:
            dataset = dataset_from_row(row)
        # Delete inputs folder (then add it back as if was never gone :D)
        shutil.rmtree(config.DATASET_DIR / dataset['name'] / config.DATASET_INPUT_DIR_NAME, ignore_errors=True)
        os.makedirs(config.DATASET_DIR / dataset['name'] / config.DATASET_INPUT_DIR_NAME, exist_ok=True)
        super().set_progress(1)
        super().set_status('Deleting Inputs From DB')
        update_job(self)
        # Delete all inputs of dataset from DB
        delete_all_inputs_of_dataset(dataset_id)
        super().set_progress(2)

        super().clean_up_job()
