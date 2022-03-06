import uuid
from collections import deque
from threading import Timer
from typing import Deque
from typing import List

from db.commands.job_commands import add_job
from config import constants
from config import config as c
from job.base_job import BaseJob
from log.logger import log
from sio_namespaces.job_namespace import jobs_namespace


class JobCreator:
    def __init__(self):
        self.jobs: List[BaseJob] = []

    def create(self, *args: BaseJob):
        for job in args:
            job.set_id(uuid.uuid4())
            self.jobs.append(job)
        return self

    def append_jobs(self, *args: BaseJob):
        self.jobs.extend(args)
        return self

    def queue(self) -> List[str]:
        queued_ids: List[str] = []
        for job in self.jobs:
            queued_ids.append(job.id().hex)
            add_job(job)
        JobManager.get_instance().add_jobs(self.jobs)
        return queued_ids


class JobManager:
    __instance = None

    @staticmethod
    def get_instance():
        if JobManager.__instance is None:
            JobManager(0.5, log_jobs=False)
        return JobManager.__instance

    def __init__(self, interval, log_jobs=False):
        """Virtually private constructor."""

        if JobManager.__instance is not None:
            raise Exception("JobManager must be accessed through `instance()`.")
        else:
            JobManager.__instance = self

        self._timer: Timer = None
        self.job_queue: Deque[BaseJob] = deque()
        self.interval = interval
        self.is_running = False
        self.logging = log_jobs

    # Actual job that is ran each interval
    def task(self):
        """First remove jobs from the queue that have finished already"""
        for job in list(self.job_queue):
            if job.has_started() and job.has_finished():
                self.job_queue.remove(job)
                jobs_namespace.update_users_of_job_finishing(job.id().hex)
            if job.has_cancelled():
                self.job_queue.remove(job)
        """Then run all jobs in the queue if they have not already started"""
        log(f"Job Queue Length: {len(self.job_queue)}", log_it=self.logging)
        for job in list(self.job_queue):
            if not job.has_started():
                log(f"Starting Job {str(job)}", log_it=self.logging)
                job.start()

    def _run(self):
        self.is_running = False
        self.start()
        self.task()

    def start(self):
        if not self.is_running:
            self._timer = Timer(self.interval, self._run)
            self._timer.start()
            self.is_running = True

    def stop(self):
        self._timer.cancel()
        self.is_running = False

    def add_jobs(self, jobs: List[BaseJob]):
        self.job_queue.extend(jobs)

    def add_job(self, job: BaseJob):
        self.job_queue.append(job)

    def cancel_job(self, job_id):
        job_cancelled = False
        job_found = False
        for job in self.job_queue:
            if job.id().hex == job_id:
                log(f'Cancelling job: {job.id().hex}')
                job_found = True
                try:
                    job.exit()
                except SystemExit:
                    log(f'Job Cancelled: {job.id().hex}')
                    if job.job_name() in constants.GPU_JOBS:
                        c.ENGINE_GPU_TASK_RUNNING = False
                        if job.job_name() == constants.IMAGE_CLASSIFICATION_TEST_JOB_NAME:
                            c.ENGINE_TEST_TASK_RUNNING = False
                    job_cancelled = True
                except Exception as e:
                    log(e)
                    job_cancelled = False
        return job_found, job_cancelled

    def __call__(self, *args, **kwargs):
        raise TypeError("JobManager must be accessed through `instance()`.")
