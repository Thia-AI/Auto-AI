import { Dataset, Labels } from '_/renderer/view/helpers/constants/engineDBTypes';

/**
 * State for the current active dataset (for Dataset page).
 */
export interface IActiveDatasetReducer {
	value: {
		dataset: Dataset;
		labels: Labels;
	};
}
