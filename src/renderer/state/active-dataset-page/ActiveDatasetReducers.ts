import { CHANGE_ACTIVE_DATASET } from '_state/types';
import { IChangeActiveDatasetAction } from './model/actionTypes';
import { IActiveDatasetReducer } from './model/reducerTypes';

// State for the current active dataset (for Dataset page)
const initialActiveDatasetState: IActiveDatasetReducer = {
	value: undefined,
};

export const activeDatasetReducer = (
	state = initialActiveDatasetState,
	action: IChangeActiveDatasetAction,
): IActiveDatasetReducer => {
	switch (action.type) {
		case CHANGE_ACTIVE_DATASET:
			return {
				value: action.payload.activeDataset,
			};
		default:
			return state;
	}
};