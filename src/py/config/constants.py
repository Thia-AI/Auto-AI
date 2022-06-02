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

# Database Constants
NUM_INSTANCES = 'NUM_INSTANCES'

# Map for our image classification model names to a EfficientNetV2 model
IC_MODEL_TYPE_TO_EFFICIENTNET_MAP = {
    'extra_small': 'efficientnetv2-b0',
    'small': 'efficientnetv2-b3',
    'medium': 'efficientnetv2-s',
    'large': 'efficientnetv2-m',
    'extra-large': 'efficientnetv2-l'
}


# Model Statuses

class AutoNameEnum(Enum):
    def _generate_next_value_(name: str, start: int, count: int, last_values: List[Any]) -> Any:
        return name


class AutoNameLowercaseHyphenatedSpace(Enum):
    def _generate_next_value_(name: str, start: int, count: int, last_values: List[Any]) -> Any:
        return name.lower().replace('_', '-')


class ModelType(AutoNameLowercaseHyphenatedSpace):
    """Enum that contains different image classification model types"""
    EXTRA_SMALL = auto()
    SMALL = auto()
    MEDIUM = auto()
    LARGE = auto()
    EXTRA_LARGE = auto()


POSSIBLE_MODEL_TYPES = set([model_type.value for model_type in ModelType])


class ModelExportType(AutoNameEnum):
    """Enum that contains different model export types"""
    SAVED_MODEL = auto()
    LITE = auto()


POSSIBLE_MODEL_EXPORT_TYPES = set([export_type.value for export_type in ModelExportType])


class ModelLabellingType(AutoNameEnum):
    """Enum that contains different model labelling types"""
    SINGLE_LABEL = auto()


POSSIBLE_MODEL_LABELLING_TYPES = set([export_type.value for export_type in ModelLabellingType])


class ModelExportStatus(AutoNameEnum):
    """Enum that contains the different status of model exports"""
    EXPORTING = auto()
    EXPORTED = auto()
    ERROR = auto()


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
