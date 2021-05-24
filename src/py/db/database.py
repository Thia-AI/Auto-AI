import atexit
import os
import sqlite3

from db.commands.base_command import DBCommand
from db.sqlite_worker import Sqlite3Worker
from log.logger import log
from config import config


class DBManager(object):
    """sqlite3 database class that manages one connection"""

    __instance = None

    @staticmethod
    def get_instance():
        if DBManager.__instance is None:
            DBManager()
        return DBManager.__instance

    def __init__(self):
        """Virtually private constructor"""

        if DBManager.__instance is not None:
            raise Exception("DBManager must be accessed through `instance()`")
        else:
            DBManager.__instance = self

        # Create directories for database file if not already exists
        os.makedirs(os.path.dirname(config.DATABASE_LOCATION.absolute()), exist_ok=True)
        # self.__connection = sqlite3.connect(DBManager.__DB_LOCATION)
        self.__connection = Sqlite3Worker(config.DATABASE_LOCATION.absolute())
        # Row factory allows us to access rows via keys instead of indices
        self.__connection.row_factory = sqlite3.Row
        # Register connection to close at exit
        atexit.register(self.__connection.close)
        # Create all tables required, if not already existing
        self.__create_tables_if_not_exist()

    def __create_tables_if_not_exist(self):
        try:
            self.__connection.execute('''CREATE TABLE IF NOT EXISTS jobs
                       (id varchar(32) not null, 
                       job_name text not null, 
                       has_started integer not null, 
                       has_finished integer not null, 
                       status text,
                       progress integer,
                       progress_max integer,
                       date_started datetime,
                       date_finished datetime)''')
        except sqlite3.Error as e:
            log("[SQLITE] - failed to create table")
            log(str(e))

    def close(self):
        self.__connection.close()

    def commit(self):
        """commit changes to database"""
        self.__connection.commit()

    def execute(self, command: DBCommand):
        result = None
        try:
            result = self.__connection.execute(command.exec_string(), command.values())
        except sqlite3.Error as e:
            log(f"[SQLITE] - DBCommand '{command.name()}' failed")
            log(str(e))
        return result

    def __call__(self, *args, **kwargs):
        raise TypeError("JobManager must be accessed through `instance()`.")
