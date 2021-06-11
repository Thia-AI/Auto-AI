from config import route_helper_constants as req_constants


def validate_req_json_helper(req: dict, expected_req_format: dict):
    missing_keys = []
    expected_keys = expected_req_format.keys()
    for expected_key in expected_keys:
        key_errors = []
        if req_constants.REQUIRED in expected_req_format[expected_key] and (not req or expected_key not in req):
            # expected key is missing
            key_errors.append('Key missing from request')
        if req_constants.NON_EMPTY in expected_req_format[expected_key] and (not req or not req[expected_key].strip()):
            # expected key's value is empty
            key_errors.append("Key's value cannot be empty")
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
