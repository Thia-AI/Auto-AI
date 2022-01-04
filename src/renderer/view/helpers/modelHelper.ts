import {
	GENERATIVE,
	IMAGE_CLASSIFICATION,
	OBJECT_DETECTION,
	OBJECT_TRACKING,
} from './constants/modelConstants';

/**
 * Get verbose model name.
 *
 * @param modelType Model type received from **Engine**.
 * @returns Verbose model name.
 */
export const getVerboseModelType = (modelType: string | undefined) => {
	switch (modelType) {
		case IMAGE_CLASSIFICATION[0]:
			return IMAGE_CLASSIFICATION[1];
		case GENERATIVE[0]:
			return GENERATIVE[1];
		case OBJECT_DETECTION[0]:
			return OBJECT_DETECTION[1];
		case OBJECT_TRACKING[0]:
			return OBJECT_TRACKING[1];
		default:
			return ' ';
	}
};
