import { Input } from '_/renderer/view/helpers/constants/engineDBTypes';
import {
	GET_NEXT_PAGE_INPUTS,
	GET_PREVIOUS_PAGE_INPUTS,
	RESET_ACTIVE_DATASET_INPUTS,
	SET_ACTIVE_DATASET_INPUTS_PREVIEW_ID,
} from '_state/types';

/**
 * Gets previous page dataset inputs using cursor pagination.
 */
export interface IGetPreviousPageInputsAction {
	type: typeof GET_PREVIOUS_PAGE_INPUTS;
	payload: {
		inputs: Input[];
	};
}

/**
 * Gets next page dataset inputs using cursor pagination.
 */
export interface IGetNextPageInputsAction {
	type: typeof GET_NEXT_PAGE_INPUTS;
	payload: {
		inputs: Input[];
	};
}

/**
 * Resets the active dataset inputs.
 */
export interface IResetActiveDatasetInputsAction {
	type: typeof RESET_ACTIVE_DATASET_INPUTS;
}

/**
 * Sets the active dataset input ID (index) that is displayed on the larger preview.
 */
export interface ISetActiveDatasetInputsPreviewIDAction {
	type: typeof SET_ACTIVE_DATASET_INPUTS_PREVIEW_ID;
	payload: {
		value: number;
	};
}
