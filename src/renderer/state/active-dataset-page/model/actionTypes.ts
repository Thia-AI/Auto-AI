import { Dataset, Label, Labels } from '_/renderer/view/helpers/constants/engineDBTypes';
import { CHANGE_ACTIVE_DATASET, UPDATE_ACTIVE_DATASET_LABEL } from '_state/types';

/**
 * When we want to change the active dataset (for Dataset page).
 */
export interface IChangeActiveDatasetAction {
	type: typeof CHANGE_ACTIVE_DATASET;
	payload: {
		activeDataset: Dataset;
		labels: Labels;
	};
}

/**
 * When we are updating a dataset label.
 */
export interface IUpdateDatasetLabelAction {
	type: typeof UPDATE_ACTIVE_DATASET_LABEL;
	payload: {
		labelValue: string;
		label: Label;
	};
}
