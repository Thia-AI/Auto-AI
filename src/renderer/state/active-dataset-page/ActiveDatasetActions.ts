import { Dataset, Label, Labels } from '_/renderer/view/helpers/constants/engineDBTypes';
import { CHANGE_ACTIVE_DATASET, UPDATE_ACTIVE_DATASET_LABEL } from '_state/types';
import { IChangeActiveDatasetAction, IUpdateDatasetLabelAction } from './model/actionTypes';

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
