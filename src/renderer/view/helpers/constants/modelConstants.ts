// Constants that represent model types and their verbose representation
type Model_Type = [string, string];

/**
 * Tuple mapping **Engine** `MODELS:model_type` for an image classification model to its verbose representation.
 */
export const IMAGE_CLASSIFICATION: Model_Type = ['image_classification', 'Image Classification'];

/**
 * Tuple mapping **Engine** `MODELS:model_type` for a generative model to its verbose representation.
 */
export const GENERATIVE: Model_Type = ['generative', 'Generative'];

/**
 * Tuple mapping **Engine** `MODELS:model_type` for an object detection model to its verbose representation.
 */
export const OBJECT_DETECTION: Model_Type = ['object_detection', 'Object Detection'];

/**
 * Tuple mapping **Engine** `MODELS:model_type` for an object tracking model to its verbose representation.
 */
export const OBJECT_TRACKING: Model_Type = ['object_tracking', 'Object Tracking'];
