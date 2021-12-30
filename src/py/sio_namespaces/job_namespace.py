from typing import TypedDict, Dict

from flask import request
from flask_socketio import Namespace

from log.logger import log_sio


# Once upgraded to python 3.11, we use NotRequired[...] instead
# See https://www.python.org/dev/peps/pep-0655/#id3
# Python 3.11 expected release 2022-10-03 . See https://www.python.org/dev/peps/pep-0664/

class _SIO_User(TypedDict):
    sid: str


# Needs to add more optional parameters (later)
class SIO_User(_SIO_User, total=False):
    name: str


class JobNamespace(Namespace):

    def __init__(self, namespace):
        super().__init__(namespace=namespace)
        self._connected_users: Dict[str, SIO_User] = {}

    def on_connect(self):
        log_sio(f'Client connected: {request.sid}')
        self._add_user(request.sid)

    def _add_user(self, sid: str):
        user: SIO_User = {
            'sid': sid,
            'name': 'user'
        }
        self._connected_users[request.sid] = user

    def _remove_user(self, sid: str):
        del self._connected_users[sid]

    def on_disconnect(self):
        log_sio(f'Client disconnected: {request.sid}')
        self._remove_user(request.sid)

    def update_users_of_job_finishing(self, jobId: str):
        self.emit('jobFinished', jobId)

    # send() event listener
    def on_message(self, data):
        log_sio(f'Received Message from: {request.sid}. Message: {data}')

    def on_error(self, error):
        log_sio(f'Error from: {request.sid}. Error: {error}')


jobs_namespace = JobNamespace('/jobs')
