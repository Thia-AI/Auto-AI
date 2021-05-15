import sqlite3
import os
import atexit

from log.logger import log
from db.commands.base_command import DBCommand


class DBManager(object):
    """sqlite3 database class that manages one connection"""

    __DB_LOCATION = os.path.abspath(os.path.join('cache', 'engine.db'))
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
        os.makedirs(os.path.dirname(DBManager.__DB_LOCATION), exist_ok=True)
        self.__connection = sqlite3.connect(DBManager.__DB_LOCATION, check_same_thread=False)
        # Row factory allows us to access rows via keys instead of indices
        self.__connection.row_factory = sqlite3.Row
        # Register connection to close at exit
        atexit.register(self.__connection.close)
        # Create all tables required, if not already existing
        self.__create_tables_if_not_exist()

    def __create_tables_if_not_exist(self):
        try:
            c = self.__connection.cursor()
            c.execute('''CREATE TABLE IF NOT EXISTS jobs
                       (id varchar(32), job_name text, has_started integer, has_finished integer, status text)''')
        except sqlite3.Error as e:
            log("SQLITE - failed to create table")
            log(str(e))

    def close(self):
        self.__connection.close()

    def commit(self):
        """commit changes to database"""
        self.__connection.commit()

    def execute(self, command: DBCommand):
        result = None
        try:
            c = self.__connection.cursor()
            result = c.execute(command.exec_string(), command.values())
        except sqlite3.Error as e:
            log(f"SQLITE - DBCommand '{command.name()}' failed")
            log(str(e))
        self.__connection.commit()
        return result

    def __call__(self, *args, **kwargs):
        raise TypeError("JobManager must be accessed through `instance()`.")
