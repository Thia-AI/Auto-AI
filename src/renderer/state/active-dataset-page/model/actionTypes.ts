import { Dataset, Label, Labels } from '_/renderer/view/helpers/constants/engineTypes';
import { CHANGE_ACTIVE_DATASET, DATASET_FETCHING, UPDATE_ACTIVE_DATASET_LABEL } from '_state/types';

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

/**
 * When dataset is being fetched.
 */
export interface IDatasetFetchingAction {
	type: typeof DATASET_FETCHING;
	payload: {
		value: boolean;
	};
}
