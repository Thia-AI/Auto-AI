import { CHANGE_SELECTED_DATASET, RESET_SELECTED_DATASET } from '_state/types';
import { IChangeSelectedDatasetAction, IResetSelectedDatasetAction } from './model/actionTypes';
import { ISelectedDatasetReducer } from './model/reducerTypes';

const initialChangeSelectedState: ISelectedDatasetReducer = {
	value: '',
};

/**
 * State for which dataset is currently selected (value is the ID of the dataset).
 *
 * @ts
 */
export const selectedDatasetReducer = (
	state = initialChangeSelectedState,
	action: IResetSelectedDatasetAction | IChangeSelectedDatasetAction,
): ISelectedDatasetReducer => {
	switch (action.type) {
		case CHANGE_SELECTED_DATASET:
			return {
				value: action.payload.selectedDatasetID,
			};
		case RESET_SELECTED_DATASET:
			return initialChangeSelectedState;
		default:
			return state;
	}
};
