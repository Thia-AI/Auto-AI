from config import route_helper_constants as req_constants


def validate_req_json_helper(req: dict, expected_req_format: dict):
    missing_keys = []
    expected_keys = expected_req_format.keys()
    for expected_key in expected_keys:
        expected_key_requirements = expected_req_format[expected_key].split(req_constants.SPLITTER)
        key_errors = []
        if req_constants.REQUIRED in expected_key_requirements and (not req or expected_key not in req):
            # expected key is missing
            key_errors.append('Key missing from request')
        if req_constants.STRING_NON_EMPTY in expected_key_requirements and (not req or not req[expected_key].strip()):
            # expected key's value is empty
            key_errors.append("String value cannot be empty")
        if req_constants.ARRAY_NON_EMPTY in expected_key_requirements and (not req or type(req[expected_key]) != list or len(req[expected_key]) == 0):
            # array is not empty
            key_errors.append("Array must exist and cannot be empty")

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
