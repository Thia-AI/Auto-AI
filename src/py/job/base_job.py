from abc import ABC, abstractmethod
from threading import Thread
from uuid import UUID
from overrides import EnforceOverrides, overrides
from datetime import datetime

from log.logger import log


class BaseJob(ABC, Thread, EnforceOverrides):
    def __init__(self, arg, job_name: str, initial_status: str):
        Thread.__init__(self, name=job_name, daemon=True)
        self.arg = arg
        self.__job_name: str = job_name
        self.__has_started = False
        self.__has_finished = False
        self.__id: UUID = None
        self.__status = initial_status
        self.__date_started = None
        self.__date_finished = None

    @abstractmethod
    @overrides
    def run(self):
        log(f"Started Job: {str(self)}")
        self.__has_started = True
        self.__date_started = datetime.now()
        from db.commands.job_commands import update_job
        update_job(self)

    def run_async(self):
        self.run()

    def job_name(self):
        return self.__job_name

    def has_started(self):
        return self.__has_started

    def has_finished(self):
        return self.__has_finished

    def clean_up_job(self):
        self.__has_finished = True
        self.__date_finished = datetime.now()
        self.__status = "Done"
        from db.commands.job_commands import update_job
        update_job(self)

    def date_started(self):
        return self.__date_started

    def date_finished(self):
        return self.__date_finished

    def set_id(self, uuid: UUID):
        self.__id = uuid

    def id(self):
        return self.__id

    def status(self):
        return self.__status

    def set_status(self, new_status: str):
        self.__status = new_status

    def __str__(self):
        return f"(JOB: {self.job_name()} | ID: {self.id().hex})"
