import time

from overrides import overrides

from db.commands.input_commands import update_input_label_v2
from db.commands.job_commands import update_job
from job.base_job import BaseJob
import config.config as c


class UpdateManyInputLabelsJob(BaseJob):
    def __init__(self, args: list[tuple]):
        # args item: (label, dataset_id, file_name)
        super().__init__(args, job_name="Batch Labelling", initial_status="Updating DB records",
                         progress_max=len(args))

    @overrides
    def run(self):
        super().run()
        c.ENGINE_BATCH_LABELLING_RUNNING = True
        # update progress every 1s
        amount_of_time_to_update_after = 1
        start_time = time.time()
        values = self.arg
        num_labels_updated = 0
        for value in values:
            update_input_label_v2(value)
            num_labels_updated += 1
            self.set_progress(num_labels_updated)
            if time.time() - start_time >= amount_of_time_to_update_after:
                update_job(self)
                start_time = time.time()
        # Done updating labels, recalibrate the input counts
        dataset_id = values[0][1]
        c.ENGINE_BATCH_LABELLING_RUNNING = False
        super().clean_up_job()
