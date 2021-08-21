from typing import Final

# Request Body Constants

REQ_HELPER_SPLITTER: Final = ','
# validating request JSON's format
REQ_HELPER_REQUIRED: Final = 'required'
REQ_HELPER_STRING_NON_EMPTY: Final = 'string-non-empty'
REQ_HELPER_ARRAY_NON_EMPTY: Final = 'array-non-empty'
REQ_HELPER_INTEGER_OPTIONAL: Final = 'number-optional'
REQ_HELPER_BASE64_ENCODED_DATETIME: Final = 'base64_encoded_datetime'

# Input Pagination Constant

INPUT_PAGINATION_DEFAULT_LIMIT: Final = 10
INPUT_PAGINATION_LIMIT_MAX: Final = 50
