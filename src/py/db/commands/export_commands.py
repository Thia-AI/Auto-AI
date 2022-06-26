from datetime import datetime

from config.constants import ICModelExportStatus, NUM_INSTANCES
from db.commands.base_commands import DBCommand
from db.database import DBManager


def add_export_to_db(model_id: str, export_job_id: str, save_path: str, export_type: str, export_id: str, export_date: datetime):
    cmd = DBCommand(name=f"Add Export",
                    command='''INSERT INTO exports (id, export_status, export_type, save_path, export_job_id, model_id, export_date)
                    values (?, ?, ?, ?, ?, ?, ?)''',
                    values=(
                        export_id, ICModelExportStatus.EXPORTING.value, export_type, save_path, export_job_id, model_id, export_date
                    ))
    DBManager.get_instance().execute(cmd)


def update_export_status(export_job_id: str, export_status: str):
    cmd = DBCommand(name=f"Update Export {export_job_id}",
                    command='''UPDATE exports SET export_status = ? WHERE id = ?''',
                    values=(export_status, export_job_id))
    DBManager.get_instance().execute(cmd)


def get_active_model_exports(model_id: str):
    cmd = DBCommand(name=f"Get active exports for model: {model_id}",
                    command='''
                    SELECT e.*
                    FROM exports as e,
                         models as m
                    WHERE e.model_id = m.id
                      AND e.model_id = ?
                      AND e.export_status = ?''',
                    values=(model_id, ICModelExportStatus.EXPORTING.value))
    return DBManager.get_instance().execute(cmd)


def get_num_exports():
    cmd = DBCommand(name="Get Number of Exports", command=f'''SELECT COUNT( DISTINCT id) AS '{NUM_INSTANCES}' FROM exports''',
                    )
    rows = DBManager.get_instance().execute(cmd)
    for row in rows:
        return row[NUM_INSTANCES]
