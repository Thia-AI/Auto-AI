import json

import job.base_job as base
from db.commands.base_commands import DBCommand
from db.database import DBManager
from log.logger import log


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
    try:
        extra_data = json.dumps(j.extra_data())
    except TypeError:
        # Unserializable JSON
        log(f'Unserializable JSON: {j.extra_data()}')
        extra_data = ''
    cmd = DBCommand(name=f"Update Job {str(j)}",
                    command=f'''UPDATE jobs SET has_started = ?, has_finished = ?, has_cancelled = ?, status = ?, 
                                date_started = ?, date_finished = ?, progress = ?, progress_max = ?, extra_data = ? WHERE id = ?''',
                    values=(j.has_started(), j.has_finished(), j.has_cancelled(), j.status(), str(j.date_started()),
                            str(j.date_finished()), j.progress(), j.progress_max(), extra_data, j.id().hex))
    return DBManager.get_instance().execute(cmd)


def update_job_extra_data(job_id: str, extra_data: dict):
    try:
        extra_data = json.dumps(extra_data)
    except TypeError:
        # Unserializable JSON
        log(f'Unserializable extra_data: {extra_data}')
        return
    cmd = DBCommand(name=f"Update Job: {job_id}'s extra_data",
                    command=f'''UPDATE jobs SET extra_data = ? WHERE id = ?''',
                    values=(extra_data, job_id))
    print('Executing no kizzy', flush=True)
    DBManager.get_instance().execute(cmd)
