from db.commands.base_commands import DBCommand
from db.database import DBManager


def create_dataset(uuid: str, name: str, type: str, date_created: str, date_last_accessed: str, misc_data: str):
    cmd = DBCommand(name=f"Create Dataset {name}",
                    command='''INSERT INTO datasets (id, name, type, date_created, date_last_accessed, misc_data)
                    values (?, ?, ?, ?, ?, ?)''',
                    values=(
                        uuid, name, type, date_created, date_last_accessed, misc_data
                    ))
    DBManager.get_instance().execute(cmd)


def delete_dataset(uuid: str):
    cmd = DBCommand(name=f"Delete Dataset {uuid}",
                    command=f"DELETE FROM datasets WHERE id = '{uuid}'")
    DBManager.get_instance().execute(cmd)


def get_datasets():
    cmd = DBCommand(name="Get Datasets", command='''SELECT * FROM datasets ORDER BY date_last_accessed DESC ''')
    return DBManager.get_instance().execute(cmd)


def get_dataset(uuid: str):
    cmd = DBCommand(name=f"Get Dataset With ID: {uuid}", command=f"SELECT * FROM datasets WHERE id = '{uuid}'")
    return DBManager.get_instance().execute(cmd)


def get_dataset_by_name(name: str):
    cmd = DBCommand(name=f"Get Dataset With name: {name}", command=f"SELECT * FROM datasets WHERE name = '{name}'")
    return DBManager.get_instance().execute(cmd)
