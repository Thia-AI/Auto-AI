from dateutil import parser

from config import constants
from helpers.encoding import b64_decode


def validate_req_json_helper(req: dict, expected_req_format: dict):
    missing_keys = []
    expected_keys = expected_req_format.keys()
    for expected_key in expected_keys:
        expected_key_requirements = expected_req_format[expected_key].split(constants.REQ_HELPER_SPLITTER)
        key_errors = []
        if constants.REQ_HELPER_REQUIRED in expected_key_requirements and (not req or expected_key not in req):
            # expected key is missing
            key_errors.append('Key missing from request')
            missing_keys.append([expected_key, key_errors])
            # Required is a key requirement so no bother adding other errors if it's missing
            continue
        # Everything else will assume key exists in req (if it is prefaced by constants.REQ_HELPER_REQUIRED
        if constants.REQ_HELPER_STRING_NON_EMPTY in expected_key_requirements and req:
            if type(req[expected_key]) != str:
                key_errors.append("Key's value must be a string")
            elif not req[expected_key].strip():
                # Expected key's value is empty
                key_errors.append("Key's string value cannot be empty")
        if constants.REQ_HELPER_ARRAY_NON_EMPTY in expected_key_requirements and (not req or type(req[expected_key]) != list or len(req[expected_key]) == 0):
            # array is not empty
            key_errors.append("Key's value must be an array must exist and cannot be empty")
            # TODO: Add type checking for all elements ex: STRING_ARRAY_NON_EMPTY
        if constants.REQ_HELPER_STRING_ARRAY_NON_EMPTY in expected_key_requirements and (not req or type(req[expected_key]) != list or len(req[expected_key]) == 0):
            # Array is not empty
            key_errors.append("Key's value must be an array must exist and cannot be empty")
        else:
            # Go through array and verify all indices are strings
            for elem in req[expected_key]:
                if type(elem) != str:
                    key_errors.append("Key's value must be a string-only array")
                    break
        if constants.REQ_HELPER_INTEGER_OPTIONAL in expected_key_requirements and req and expected_key in req and type(req[expected_key]) != int:
            key_errors.append("Key's value must be an integer, if provided")
        if constants.REQ_HELPER_BASE64_ENCODED_DATETIME in expected_key_requirements and req:
            try:
                parser.parse(b64_decode(req[expected_key]))
            except Exception:
                key_errors.append("Key's value must be a parse-able base64 encoded datetime")

        if len(key_errors) > 0:
            missing_keys.append([expected_key, key_errors])
    return missing_keys


def validate_req_json(req: dict, req_format: dict):
    missing_keys = validate_req_json_helper(req, req_format)
    if len(missing_keys) == 0:
        return None
    error_obj = {}
    for missing_key in missing_keys:
        error_obj[missing_key[0]] = missing_key[1]
    return error_obj
