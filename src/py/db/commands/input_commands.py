from typing import List

from db.commands.base_commands import DBCommand
from db.database import DBManager


def add_images_to_db_batch(values):
    cmd = DBCommand(name="Add Inputs To DB",
                    command='''INSERT INTO input (id, dataset_id, file_name, label, date_created) values (?, ?, ?, ?, ?)''',
                    values=values)
    DBManager.get_instance().execute(cmd)


def get_all_inputs(limit=100):
    cmd = DBCommand(name="Get All Inputs",
                    command=f'''SELECT * FROM input ORDER BY date_created DESC LIMIT {limit}''')
    return DBManager.get_instance().execute(cmd)


def delete_all_inputs_of_dataset(uuid):
    cmd = DBCommand(name=f"Delete All Inputs From Dataset '{uuid}'",
                    command='DELETE FROM input WHERE dataset_id = ?',
                    values=(uuid,))
    DBManager.get_instance().execute(cmd)
