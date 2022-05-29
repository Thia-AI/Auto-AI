import uuid

from config.constants import ModelStatus, NUM_INSTANCES
from db.commands.base_commands import DBCommand
from db.database import DBManager


def create_dataset(uuid: str, name: str, dataset_type: str, date_created: str, date_last_accessed: str, misc_data: str):
    cmd = DBCommand(name=f"Create Dataset {name}",
                    command='''INSERT INTO datasets (id, name, type, date_created, date_last_accessed, misc_data, labels)
                    values (?, ?, ?, ?, ?, ?, ?)''',
                    values=(
                        uuid, name, dataset_type, date_created, date_last_accessed, misc_data, ''
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


def add_label(label: str, dataset_id: str, color: str):
    cmd = DBCommand(name=f"Add Label: {label}, for Dataset: {dataset_id}",
                    command=f'''INSERT INTO labels (id, value, dataset_id, color)
                                VALUES (?, ?, ?, ?)''',
                    values=(uuid.uuid4().hex, label, dataset_id, color))
    DBManager.get_instance().execute(cmd)


def update_label_input_count(label: str, dataset_id: str, color: str, input_count: int):
    cmd = DBCommand(name=f"Get labels from Dataset: {dataset_id}",
                    command="SELECT * FROM labels WHERE dataset_id = ? AND value = ?",
                    values=(dataset_id, label))
    rows = DBManager.get_instance().execute(cmd)
    if rows is None or len(rows) == 0:
        # No label exists, add it
        cmd = DBCommand(name=f"Add Label: {label}, for Dataset: {dataset_id}",
                        command=f'''INSERT INTO labels (id, value, input_count, dataset_id, color) VALUES (?, ?, ?, ?, ?)''',
                        values=(uuid.uuid4().hex, label, input_count, dataset_id, color))
    else:
        # Label exists, update count
        cmd = DBCommand(name=f"Add Label: {label}, for Dataset: {dataset_id}",
                        command=f'''UPDATE labels SET input_count = input_count + ? WHERE value = ? AND dataset_id = ?''',
                        values=(input_count, label, dataset_id))
    DBManager.get_instance().execute(cmd)


def delete_label(label: str, dataset_id: str):
    cmd = DBCommand(name=f"Delete Label: {label}, from Dataset: {dataset_id}",
                    command="DELETE FROM labels WHERE dataset_id = ? AND value = ?",
                    values=(dataset_id, label))
    DBManager.get_instance().execute(cmd)


def get_labels(dataset_id: str):
    cmd = DBCommand(name=f"Get labels from Dataset: {dataset_id}",
                    command="SELECT * FROM labels WHERE dataset_id = ?",
                    values=(dataset_id,))
    return DBManager.get_instance().execute(cmd)


def get_label(dataset_id: str, label: str):
    cmd = DBCommand(name=f"Get labels from Dataset: {dataset_id}",
                    command="SELECT * FROM labels WHERE dataset_id = ? AND value = ?",
                    values=(dataset_id, label))
    return DBManager.get_instance().execute(cmd)


def update_labels_of_dataset(uuid: str, labels: str):
    cmd = DBCommand(name=f"Update Dataset {uuid}'s labels to '{labels}'",
                    command='''UPDATE datasets SET labels = ? WHERE id = ?''',
                    values=(labels, uuid))
    DBManager.get_instance().execute(cmd)


def increment_label_input_count(dataset_id: str, label: str):
    cmd = DBCommand(name=f"Increment Label: {label}'s input_count by 1 for Dataset: {dataset_id}",
                    command='''UPDATE labels SET input_count = input_count + 1 WHERE dataset_id = ? AND value = ?''',
                    values=(dataset_id, label))
    DBManager.get_instance().execute(cmd)


def decrement_label_input_count(dataset_id: str, label: str):
    cmd = DBCommand(name=f"Decrement Label: {label}'s input_count by 1 for Dataset: {dataset_id}",
                    command='''UPDATE labels SET input_count = input_count - 1 WHERE dataset_id = ? AND value = ?''',
                    values=(dataset_id, label))
    DBManager.get_instance().execute(cmd)


def add_label_input_count(dataset_id: str, label: str, amount_to_add: int):
    cmd = DBCommand(name=f"Add Label: {label}'s input_count by {amount_to_add} for Dataset: {dataset_id}",
                    command='''UPDATE labels SET input_count = input_count + ? WHERE dataset_id = ? AND value = ?''',
                    values=(amount_to_add, dataset_id, label))
    DBManager.get_instance().execute(cmd)


def delete_all_labels(dataset_id: str):
    cmd = DBCommand(name=f"Delete all Labels from Dataset: {dataset_id}",
                    command="DELETE FROM labels WHERE dataset_id = ?",
                    values=(dataset_id,))
    DBManager.get_instance().execute(cmd)


def get_num_datasets():
    cmd = DBCommand(name="Get Number of Datasets", command=f'''SELECT COUNT( DISTINCT id) AS '{NUM_INSTANCES}' FROM datasets''',
                    )
    rows = DBManager.get_instance().execute(cmd)
    for row in rows:
        return row[NUM_INSTANCES]
