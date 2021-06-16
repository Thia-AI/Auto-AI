from db.commands.base_commands import DBCommand
from db.database import DBManager
import job.base_job as base


def add_job(j: base.BaseJob) -> None:
    cmd = DBCommand(name=f"Add Job {str(j)}",
                    command='''INSERT INTO jobs (id, job_name, has_started, has_finished, status, date_started, date_finished, progress, progress_max) 
                    values (?, ?, ?, ?, ?, ?, ?, ?, ?)''',
                    values=(
                        j.id().hex, j.job_name(), int(j.has_started()), int(j.has_finished()), j.status(),
                        str(j.date_started()), str(j.date_finished()), j.progress(), j.progress_max()))
    DBManager.get_instance().execute(cmd)


def get_jobs():
    cmd = DBCommand(name="Get Jobs", command='''SELECT * FROM jobs ORDER BY date_started DESC''')
    return DBManager.get_instance().execute(cmd)


def get_job(uuid: str):
    cmd = DBCommand(name=f"Get Job With ID: {uuid}", command=f"SELECT * FROM jobs WHERE id = '{uuid}'")
    return DBManager.get_instance().execute(cmd)


def update_job(j: base.BaseJob):
    cmd = DBCommand(name=f"Update Job {str(j)}",
                    command=f'''UPDATE jobs SET has_started = ?, has_finished = ?, status = ?, 
                                date_started = ?, date_finished = ?, progress = ?, progress_max = ? WHERE id = ?''',
                    values=(j.has_started(), j.has_finished(), j.status(), str(j.date_started()),
                            str(j.date_finished()), j.progress(), j.progress_max(), j.id().hex))
    return DBManager.get_instance().execute(cmd)
