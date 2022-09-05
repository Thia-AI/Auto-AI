import { Dataset, Label, Labels } from '_/renderer/view/helpers/constants/engineTypes';
import { CHANGE_ACTIVE_DATASET, DATASET_FETCHING, UPDATE_ACTIVE_DATASET_LABEL } from '_state/types';
import { IChangeActiveDatasetAction, IDatasetFetchingAction, IUpdateDatasetLabelAction } from './model/actionTypes';

/**
 * When we want to change the active dataset (for Dataset page).
 *
 * @ts
 */
export const changeActiveDataset = (activeDataset: Dataset, labels: Labels): IChangeActiveDatasetAction => ({
	type: CHANGE_ACTIVE_DATASET,
	payload: {
		activeDataset,
		labels,
	},
});

/**
 * When we are updating a dataset label.
 *
 * @ts
 */
export const updateDatasetLabelAction = (labelValue: string, label: Label): IUpdateDatasetLabelAction => ({
	type: UPDATE_ACTIVE_DATASET_LABEL,
	payload: {
		labelValue,
		label,
	},
});

/**
 * When a dataset is being fetched.
 *
 * @ts
 */
export const datasetFetchingAction = (value: boolean): IDatasetFetchingAction => ({
	type: DATASET_FETCHING,
	payload: {
		value,
	},
});
