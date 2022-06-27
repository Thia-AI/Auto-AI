import sys
from functools import wraps
from uuid import uuid4

import requests
from flask import request

from log.logger import log
from config.constants import BACKEND_DEV_BASE_URL, BACKEND_PROD_BASE_URL


def get_server_url() -> str:
    if getattr(sys, 'frozen', False) and hasattr(sys, '_MEIPASS'):
        # Production
        if len(sys.argv) > 1 and sys.argv[1] == 'simulated':
            """Engine is ran in simulated mode during App development"""
            return BACKEND_DEV_BASE_URL
        else:
            return BACKEND_PROD_BASE_URL
    return BACKEND_DEV_BASE_URL


def verify_action(expires_in=None):
    def decorator(f):
        @wraps(f)
        def wrapper(*args, **kwargs):
            action_verification_id = uuid4().hex
            wrapper.action_verification_id = action_verification_id
            try:
                server_url = get_server_url()
                authorization_header = request.headers.get('Authorization', '')
                backend_request_data = {
                    'path': request.path,
                    'method': request.method,
                }
                if request.method in ['PUT', 'POST', 'DELETE']:
                    engine_request_body = request.get_json()
                    if engine_request_body is not None:
                        backend_request_data.update(engine_request_body)
                    # print(engine_request_body)
                r = requests.post(f'{server_url}/auth/verify-action', headers={
                    'Authorization': authorization_header
                }, data=backend_request_data)
                if r.ok:
                    out = f(*args, **kwargs)
                    if out[-1] == 200:
                        # Action does not dispatch a job (isn't asynchronous)
                        # Inform backend of completed action
                        update_backend_action_completed(backend_request_data, auth_header=authorization_header)
                    return out
                else:
                    # Return error received from backend
                    try:
                        backend_response = r.json()
                        # print(backend_response)
                        return {'Error': backend_response['message']}, 400
                    except requests.exceptions.JSONDecodeError:
                        return {'Error': 'Failed to verify action'}, 400

            except requests.exceptions.Timeout:
                return {'Error': 'Action verification timed out'}, 504
            except requests.exceptions.ConnectionError:
                return {'Error': 'Failed to connect to API'}, 502
            except Exception as e:
                log(e)
                return {'Error': 'Error occurred when verifying action'}, 500

        return wrapper

    return decorator


def update_backend_action_completed(data, auth_header=''):
    server_url = get_server_url()
    r = requests.post(f'{server_url}/auth/verify-action/complete', headers={
        'Authorization': auth_header
    }, data=data)
    if not r.ok:
        log('Update Backend Action Failed')
        try:
            out = r.json()
            log(out)
        except requests.exceptions.JSONDecodeError:
            out = r.text
            log(out)
