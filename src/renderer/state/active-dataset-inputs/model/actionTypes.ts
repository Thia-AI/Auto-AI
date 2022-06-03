import { Input } from '_/renderer/view/helpers/constants/engineTypes';
import {
	GET_NEXT_PAGE_INPUTS,
	GET_PREVIOUS_PAGE_INPUTS,
	RESET_ACTIVE_DATASET_INPUTS,
	SET_ACTIVE_DATASET_INPUTS_PREVIEW_ID,
	SET_NEXT_PAGE_CURSOR,
	SET_PREVIOUS_PAGE_CURSOR,
	UPDATE_DATASET_INPUT_LABEL,
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
 * Updates the label for a particular dataset input.
 */
export interface IUpdateDatasetInputLabelAction {
	type: typeof UPDATE_DATASET_INPUT_LABEL;
	payload: {
		inputIndex: number;
		newLabel: string;
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

/**
 * Sets the next page cursor when retreiving the next/previous page.
 */
export interface ISetNextPageCursorAction {
	type: typeof SET_NEXT_PAGE_CURSOR;
	payload: {
		value: string | null;
	};
}

/**
 * Sets the previous page cursor when retreiving the next/previous page.
 */
export interface ISetPreviousPageCursorAction {
	type: typeof SET_PREVIOUS_PAGE_CURSOR;
	payload: {
		value: string | null;
	};
}
