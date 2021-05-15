from abc import ABC, abstractmethod
from log.logger import log
from threading import Thread
from uuid import UUID
from overrides import EnforceOverrides, overrides


class BaseJob(ABC, Thread, EnforceOverrides):
    def __init__(self, arg, job_name: str, initial_status: str):
        Thread.__init__(self, name=job_name, daemon=True)
        self.arg = arg
        self.__job_name: str = job_name
        self._has_started = False
        self._has_finished = False
        self._id: UUID = None
        self._status = initial_status

    @abstractmethod
    @overrides
    def run(self):
        log(f"Started Job: {self.job_name()}")
        self._has_started = True
        pass

    def run_async(self):
        self.run()

    def job_name(self):
        return self.__job_name

    def has_started(self):
        return self._has_started

    def has_finished(self):
        return self._has_finished

    def clean_up_job(self):
        self._has_finished = True

    def set_id(self, uuid: UUID):
        self._id = uuid

    def id(self):
        return self._id

    def status(self):
        return self._status

    def set_status(self, new_status: str):
        self._status = new_status

    def __str__(self):
        return f"(JOB: {self.job_name()} | ID: {self.id()})"
