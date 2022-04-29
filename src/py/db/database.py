import atexit
import os
import sqlite3

from config import config
from db.commands.base_commands import DBCommand
from db.sqlite_worker import Sqlite3Worker
from log.logger import log


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
            # Jobs
            self.__connection.execute('''CREATE TABLE IF NOT EXISTS jobs (
               id varchar(32) not null primary key, 
               job_name text not null, 
               has_started integer default 0, 
               has_finished integer default 0, 
               has_cancelled integer default 0,
               status text,
               progress integer,
               progress_max integer,
               date_started datetime,
               date_finished datetime,
               extra_data json
           )''')
            # Models
            self.__connection.execute('''CREATE TABLE IF NOT EXISTS models (
                id varchar(32) not null primary key,
                model_name text not null, 
                model_type text not null,
                model_type_extra text not null,
                date_created datetime not null,
                date_last_accessed datetime not null,
                model_status text not null, 
                latest_train_job_id varchar(32),
                extra_data json
            )''')
            # Datasets
            self.__connection.execute('''CREATE TABLE IF NOT EXISTS datasets (
                 id varchar(32) not null primary key,
                 name text not null,
                 type text not null,
                 date_created datetime not null,
                 date_last_accessed datetime not null,
                 labels text not null,
                 misc_data text not null
             )''')
            # Input (for a dataset, i.e. images)
            self.__connection.execute('''CREATE TABLE IF NOT EXISTS input
                (id varchar(32) not null primary key,
                dataset_id varchar(32) not null,
                file_name text not null,
                label text not null,
                date_created datetime not null
            )''')
            # Labels for a dataset
            self.__connection.execute('''CREATE TABLE IF NOT EXISTS labels (
                id varchar(32) not null primary key,
                value varchar(32) not null,
                input_count integer default 0,
                dataset_id varchar(32) not null,
                color text not null,
                foreign key (dataset_id) references datasets(id)
            )''')
            # Exports
            self.__connection.execute('''CREATE TABLE IF NOT EXISTS exports (
                id varchar(32) not null primary key,
                export_status text not null,
                export_type text not null,
                save_path text not null,
                export_date datetime not null,
                export_job_id varchar(32) not null,
                model_id varchar(32) not null,
                foreign key (model_id) references models(id),
                foreign key (export_job_id) references jobs(id)
            )''')
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
