import { CHANGE_SELECTED_DATASET, RESET_SELECTED_DATASET } from '_state/types';

/**
 * When we want to change the currently selected dataset to train.
 */
export interface IChangeSelectedDatasetAction {
	type: typeof CHANGE_SELECTED_DATASET;
	payload: {
		selectedDatasetID: string;
	};
}

/**
 * When we want to reset the currently selected dataset.
 */
export interface IResetSelectedDatasetAction {
	type: typeof RESET_SELECTED_DATASET;
}
