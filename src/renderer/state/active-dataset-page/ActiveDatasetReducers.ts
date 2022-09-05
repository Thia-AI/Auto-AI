import { nullDataset } from '_/renderer/view/helpers/constants/engineTypes';
import { CHANGE_ACTIVE_DATASET, DATASET_FETCHING, UPDATE_ACTIVE_DATASET_LABEL } from '_state/types';
import { IChangeActiveDatasetAction, IDatasetFetchingAction, IUpdateDatasetLabelAction } from './model/actionTypes';
import { IActiveDatasetReducer, IDatasetFetchingReducer } from './model/reducerTypes';

const initialActiveDatasetState: IActiveDatasetReducer = {
	value: {
		dataset: nullDataset,
		labels: {},
	},
};

/**
 * State for the current active dataset (for Dataset page).
 *
 * @ts
 */
export const activeDatasetReducer = (
	state = initialActiveDatasetState,
	action: IChangeActiveDatasetAction | IUpdateDatasetLabelAction,
): IActiveDatasetReducer => {
	switch (action.type) {
		case CHANGE_ACTIVE_DATASET:
			return {
				value: {
					dataset: action.payload.activeDataset,
					labels: action.payload.labels,
				},
			};
		case UPDATE_ACTIVE_DATASET_LABEL:
			const stateCopy = {
				...state,
			};
			stateCopy.value.labels[action.payload.labelValue] = action.payload.label;
			return stateCopy;
		default:
			return state;
	}
};

const initialDatasetFetchingState: IDatasetFetchingReducer = {
	value: false,
};

/**
 * State for when a dataset is being fetched.
 *
 * @ts
 */
export const datasetFetchingReducer = (
	state = initialDatasetFetchingState,
	action: IDatasetFetchingAction,
): IDatasetFetchingReducer => {
	switch (action.type) {
		case DATASET_FETCHING:
			return {
				value: action.payload.value,
			};
		default:
			return state;
	}
};
