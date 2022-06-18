import sys
from functools import wraps
from flask import request
import requests

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


def verify_action(f):
    @wraps(f)
    def decorator(*args, **kwargs):
        try:
            server_url = get_server_url()
            authorization_header = request.headers.get('Authorization', '')

            r = requests.post(f'{server_url}/auth/verify-action', headers={
                'Authorization': authorization_header
            }, data={
                'path': request.path,
                'method': request.method
            })
            if r.ok:
                out = f(*args, **kwargs)
                return out
            else:
                return {'Error': 'Failed to verify action'}, 400
        except requests.exceptions.Timeout:
            return {'Error': 'Action verification timed out'}, 504
        except requests.exceptions.ConnectionError:
            return {'Error': 'Failed to request action verification'}, 502
        except Exception as e:
            print(e)
            return {'Error': 'Error occurred when verifying action'}, 500

    return decorator
