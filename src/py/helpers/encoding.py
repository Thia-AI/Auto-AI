from base64 import b64encode, b64decode


def b64_encode(data_to_encode: str):
    return b64encode(data_to_encode.encode('ascii')).decode('ascii')


def b64_decode(data_to_decode: str):
    return b64decode(data_to_decode.encode('ascii')).decode('ascii')
