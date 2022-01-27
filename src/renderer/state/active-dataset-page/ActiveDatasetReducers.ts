import { nullDataset } from '_/renderer/view/helpers/constants/engineDBTypes';
import { CHANGE_ACTIVE_DATASET, UPDATE_ACTIVE_DATASET_LABEL } from '_state/types';
import { IChangeActiveDatasetAction, IUpdateDatasetLabelAction } from './model/actionTypes';
import { IActiveDatasetReducer } from './model/reducerTypes';

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
