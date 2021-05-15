from db.commands.base_command import DBCommand
from db.database import DBManager
from job.base_job import BaseJob


def add_job(job: BaseJob) -> None:
    cmd = DBCommand(name=f"Add Job {str(job)}", command='''INSERT INTO jobs (id, job_name, has_started, has_finished, status) 
    values (?, ?, ?, ?, ?)''',
                    values=(
                        job.id().hex, job.job_name(), int(job.has_started()), int(job.has_finished()), job.status()))
    DBManager.get_instance().execute(cmd)


def get_jobs():
    cmd = DBCommand(name="Get Jobs", command='''SELECT * FROM jobs''')
    return DBManager.get_instance().execute(cmd)


def get_job(uuid: str):
    cmd = DBCommand(name=f"Get Job With ID: {uuid}", command=f"SELECT * FROM jobs WHERE id = '{uuid}'")
    return DBManager.get_instance().execute(cmd)


def update_job(job: BaseJob):
    cmd = DBCommand(name=f"Update Job {str(job)}",
                    command=f"UPDATE jobs SET has_started = ?, has_finished = ?, status = ? WHERE id = ?",
                    values=(job.has_started(), job.has_finished(), job.status(), job.id().hex))
    return DBManager.get_instance().execute(cmd)
