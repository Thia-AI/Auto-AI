import json

from config.constants import ModelStatus
from db.commands.base_commands import DBCommand
from db.database import DBManager


def create_model(uuid: str, model_name: str, model_type: str, model_type_extra: str, date_created: str,
                 date_last_accessed: str) -> None:
    cmd = DBCommand(name=f"Create Model {model_name}",
                    command='''INSERT INTO models (id, model_name, model_type, model_type_extra, date_created, date_last_accessed, model_status)
                    values (?, ?, ?, ?, ?, ?, ?)''',
                    values=(
                        uuid, model_name, model_type, model_type_extra, date_created, date_last_accessed, ModelStatus.IDLE.value
                    ))
    DBManager.get_instance().execute(cmd)


def update_model_status(model_id: str, status: ModelStatus):
    cmd = DBCommand(name=f"Update Model: {model_id}'s status to {status.value}",
                    command=f'''UPDATE models SET model_status = ? WHERE id = ?''',
                    values=(status.value, model_id))
    DBManager.get_instance().execute(cmd)


def update_model_extra_data(model_id: str, new_extra_data: dict):
    try:
        extra_data = json.dumps(new_extra_data)
    except TypeError:
        # Unserializable JSON
        log(f'Unserializable JSON: {j.extra_data()}')
        extra_data = ''
    cmd = DBCommand(name=f"Update Model: {model_id}'s extra_data",
                    command=f'''UPDATE models SET extra_data = ? WHERE id = ?''',
                    values=(extra_data, model_id))

    DBManager.get_instance().execute(cmd)


def update_model_train_job_id(model_id: str, training_job_id: str):
    cmd = DBCommand(name=f"Update Model: {model_id}'s training job id to '{training_job_id}'",
                    command=f'''UPDATE models SET latest_train_job_id = ? WHERE id = ?''',
                    values=(training_job_id, model_id))
    DBManager.get_instance().execute(cmd)


def get_models():
    cmd = DBCommand(name='Get Models', command='''SELECT * FROM models ORDER BY date_last_accessed DESC''')
    return DBManager.get_instance().execute(cmd)


def get_model(uuid: str):
    cmd = DBCommand(name=f"Get Model With ID: {uuid}", command=f"SELECT * FROM models WHERE id = '{uuid}'")
    return DBManager.get_instance().execute(cmd)
