import { Dataset } from '_/renderer/view/helpers/constants/engineDBTypes';

/**
 * State for the current active dataset (for Dataset page).
 */
export interface IActiveDatasetReducer {
	value: Dataset | undefined;
}
