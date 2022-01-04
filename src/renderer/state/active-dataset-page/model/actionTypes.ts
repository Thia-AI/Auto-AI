import { Dataset } from '_/renderer/view/helpers/constants/engineDBTypes';
import { CHANGE_ACTIVE_DATASET } from '_state/types';

/**
 * When we want to change the active dataset (for Dataset page).
 */
export interface IChangeActiveDatasetAction {
	type: typeof CHANGE_ACTIVE_DATASET;
	payload: {
		activeDataset: Dataset;
	};
}
