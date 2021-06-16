from db.commands.base_commands import DBCommand
from db.database import DBManager


def create_model(uuid: str, model_name: str, model_type: str, model_type_extra: str, date_created: str,
                 date_last_accessed: str) -> None:
    cmd = DBCommand(name=f"Create Model {model_name}",
                    command='''INSERT INTO models (id, model_name, model_type, model_type_extra, date_created, date_last_accessed)
                    values (?, ?, ?, ?, ?, ?)''',
                    values=(
                        uuid, model_name, model_type, model_type_extra, date_created, date_last_accessed
                    ))
    DBManager.get_instance().execute(cmd)


def get_models():
    cmd = DBCommand(name='Get Models', command='''SELECT * FROM models ORDER BY date_last_accessed DESC''')
    return DBManager.get_instance().execute(cmd)


def get_model(uuid: str):
    cmd = DBCommand(name=f"Get Model With ID: {uuid}", command=f"SELECT * FROM models WHERE id = '{uuid}'")
    return DBManager.get_instance().execute(cmd)
