import {
	GET_NEXT_PAGE_INPUTS,
	GET_PREVIOUS_PAGE_INPUTS,
	RESET_ACTIVE_DATASET_INPUTS,
	SET_ACTIVE_DATASET_INPUTS_PREVIEW_ID,
} from '_state/types';
import {
	IGetNextPageInputsAction,
	IGetPreviousPageInputsAction,
	IResetActiveDatasetInputsAction,
	ISetActiveDatasetInputsPreviewIDAction,
} from './model/actionTypes';
import {
	IActiveDatasetInputsPreviewIDReducer,
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
		| IResetActiveDatasetInputsAction,
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
