import uuid
from datetime import datetime

from db.commands.base_commands import DBCommand
from config.constants import ModelExportStatus
from db.database import DBManager


def add_export_to_db(model_id: str, export_job_id: str, save_path: str, export_type: str, export_id: str):
    cmd = DBCommand(name=f"Add Export",
                    command='''INSERT INTO exports (id, export_status, export_type, save_path, export_job_id, model_id, export_date)
                    values (?, ?, ?, ?, ?, ?, ?)''',
                    values=(
                        export_id, ModelExportStatus.EXPORTING.value, export_type, save_path, export_job_id, model_id, datetime.now()
                    ))
    DBManager.get_instance().execute(cmd)


def update_export_status(export_job_id: str, export_status: str):
    cmd = DBCommand(name=f"Update Export {export_job_id}",
                    command='''UPDATE exports SET export_status = ? WHERE id = ?''',
                    values=(export_status, export_job_id))
    DBManager.get_instance().execute(cmd)
