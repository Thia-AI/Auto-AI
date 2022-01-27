import {
	GET_NEXT_PAGE_INPUTS,
	GET_PREVIOUS_PAGE_INPUTS,
	RESET_ACTIVE_DATASET_INPUTS,
	SET_ACTIVE_DATASET_INPUTS_PREVIEW_ID,
	SET_NEXT_PAGE_CURSOR,
	SET_PREVIOUS_PAGE_CURSOR,
	UPDATE_DATASET_INPUT_LABEL,
} from '_state/types';
import {
	IGetNextPageInputsAction,
	IGetPreviousPageInputsAction,
	IResetActiveDatasetInputsAction,
	ISetActiveDatasetInputsPreviewIDAction,
	ISetNextPageCursorAction,
	ISetPreviousPageCursorAction,
	IUpdateDatasetInputLabelAction,
} from './model/actionTypes';
import {
	INextPageCursorReducer,
	IActiveDatasetInputsPreviewIDReducer,
	IPreviousPageCursorReducer,
	IActiveDatasetInputsReducer,
} from './model/reducerTypes';

const initialActiveDatasetInputsState: IActiveDatasetInputsReducer = {
	value: [],
};

/**
 * State for the dataset inputs that are displayed using cursor pagination.
 *
 * @ts
 */
export const activeDatasetInputsReducer = (
	state = initialActiveDatasetInputsState,
	action:
		| IGetNextPageInputsAction
		| IGetPreviousPageInputsAction
		| IResetActiveDatasetInputsAction
		| IUpdateDatasetInputLabelAction,
): IActiveDatasetInputsReducer => {
	switch (action.type) {
		case GET_NEXT_PAGE_INPUTS:
		case GET_PREVIOUS_PAGE_INPUTS:
			return {
				value: action.payload.inputs,
			};
		case RESET_ACTIVE_DATASET_INPUTS:
			return {
				value: [],
			};
		case UPDATE_DATASET_INPUT_LABEL:
			const stateCopy = [...state.value];
			const newInput = {
				...stateCopy[action.payload.inputIndex],
				label: action.payload.newLabel,
			};
			stateCopy[action.payload.inputIndex] = newInput;

			return {
				value: stateCopy,
			};
		default:
			return state;
	}
};

const initialActiveDatasetInputsPreviewID: IActiveDatasetInputsPreviewIDReducer = {
	value: 0,
};

/**
 * State for the active dataset input ID (index) that is displayed on the larger preview.
 *
 * @ts
 */
export const activeDatasetInputsPreviewIDReducer = (
	state = initialActiveDatasetInputsPreviewID,
	action: ISetActiveDatasetInputsPreviewIDAction,
): IActiveDatasetInputsPreviewIDReducer => {
	switch (action.type) {
		case SET_ACTIVE_DATASET_INPUTS_PREVIEW_ID:
			return {
				value: action.payload.value,
			};
		default:
			return state;
	}
};

const initialNextPageCursorReducer: INextPageCursorReducer = {
	value: null,
};

/**
 * State for the next page cursor (or null if no next page) for dataset inputs.
 *
 * @ts
 */
export const nextPageCursorReducer = (
	state = initialNextPageCursorReducer,
	action: ISetNextPageCursorAction,
): INextPageCursorReducer => {
	switch (action.type) {
		case SET_NEXT_PAGE_CURSOR:
			return {
				value: action.payload.value,
			};
		default:
			return state;
	}
};

const initialPreviousPageCursorReducer: IPreviousPageCursorReducer = {
	value: null,
};

/**
 * State for the previous page cursor (or null if no previous page) for dataset inputs.
 *
 * @ts
 */
export const previousPageCursorReducer = (
	state = initialPreviousPageCursorReducer,
	action: ISetPreviousPageCursorAction,
): IPreviousPageCursorReducer => {
	switch (action.type) {
		case SET_PREVIOUS_PAGE_CURSOR:
			return {
				value: action.payload.value,
			};
		default:
			return state;
	}
};
