// Constants that represent a model's potential states

export const IDLE = 'idle';

export const TRAINING = 'training';

export const ERROR = 'error';

// Constants that represent model types and their verbose representation
type Model_Type = [string, string];

export const IMAGE_CLASSIFICATION: Model_Type = ['image_classification', 'Image Classification'];

export const GENERATIVE: Model_Type = ['generative', 'Generative'];

export const OBJECT_DETECTION: Model_Type = ['object_detection', 'Object Detection'];

export const OBJECT_TRACKING: Model_Type = ['object_tracking', 'Object Tracking'];
