import { Dataset, Labels } from '_/renderer/view/helpers/constants/engineTypes';

/**
 * State for the current active dataset (for Dataset page).
 */
export interface IActiveDatasetReducer {
	value: {
		dataset: Dataset;
		labels: Labels;
	};
}

/**
 * When a dataset is being fetched.
 */
export interface IDatasetFetchingReducer {
	value: boolean;
}
