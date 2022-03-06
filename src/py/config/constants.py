from enum import Enum, auto

from typing import Final, List, Any

# Request Body Constants

REQ_HELPER_SPLITTER: Final = ','
# validating request JSON's format
REQ_HELPER_REQUIRED: Final = 'required'
'''Body param is required.'''
REQ_HELPER_STRING_NON_EMPTY: Final = 'string-non-empty'
'''Body param must be a non-empty string.'''
REQ_HELPER_ARRAY_NON_EMPTY: Final = 'array-non-empty'
'''Body param must be a non empty array of any type.'''
REQ_HELPER_STRING_ARRAY_NON_EMPTY: Final = 'string-array-non-empty'
'''Body param must be a non empty string array.'''
REQ_HELPER_INTEGER_OPTIONAL: Final = 'number-optional'
'''Body param is option but must be an integer if provided.'''
REQ_HELPER_BASE64_ENCODED_DATETIME: Final = 'base64_encoded_datetime'
'''Body param must be a base64 encoded, parseable datetime.'''

# Input Pagination Constant

INPUT_PAGINATION_DEFAULT_LIMIT: Final = 10
INPUT_PAGINATION_LIMIT_MAX: Final = 50

# Dataset Constants

DATASET_LABELS_SPLITTER: Final = '|'
DATASET_UNLABELLED_LABEL: str = 'unlabelled'

# Jobs
CANCELLABLE_JOBS = ['Image Classification Test']
IMAGE_CLASSIFICATION_TEST_JOB_NAME = 'Image Classification Test'
IMAGE_CLASSIFICATION_TRAINING_JOB_NAME = 'Image Classification Training'

GPU_JOBS = [IMAGE_CLASSIFICATION_TEST_JOB_NAME, IMAGE_CLASSIFICATION_TRAINING_JOB_NAME]


# Model Statuses
class AutoNameEnum(Enum):
    def _generate_next_value_(name: str, start: int, count: int, last_values: List[Any]) -> Any:
        return name


class ModelStatus(AutoNameEnum):
    """Enum that contains different statuses (or states) a model can be in at any given time."""
    IDLE = auto()
    TRAINING = auto()
    STARTING_TRAINING = auto()
    TRAINED = auto()
    RETRAINING = auto()
    ERROR = auto()


class TrainJobStatus(AutoNameEnum):
    """Enum that contains different statuses (or states) a training job can be in at any given time."""
    TRAINING = auto()
    STARTING_TRAINING = auto()
    TRAINED = auto()
    EVALUATING = auto()
    EVALUATED = auto()
    ERROR = auto()
