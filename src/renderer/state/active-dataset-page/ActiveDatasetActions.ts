import { Dataset } from '_/renderer/view/helpers/constants/engineDBTypes';
import { CHANGE_ACTIVE_DATASET } from '_state/types';
import { IChangeActiveDatasetAction } from './model/actionTypes';

// When we want to change the active dataset (for Dataset page)
export const changeActiveDataset = (activeDataset: Dataset): IChangeActiveDatasetAction => ({
	type: CHANGE_ACTIVE_DATASET,
	payload: {
		activeDataset,
	},
});
