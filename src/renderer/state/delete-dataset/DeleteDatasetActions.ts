import { Dataset } from '_/renderer/view/helpers/constants/engineDBTypes';
import { OPEN_CLOSE_DELETE_DATASET } from '../types';
import { IOpenCloseDeleteDatasetAction } from './model/actionTypes';

// When we want to open/close the delete dataset dialog
export const openCloseDeleteDatasetAction = (dataset: Dataset): IOpenCloseDeleteDatasetAction => ({
	type: OPEN_CLOSE_DELETE_DATASET,
	payload: {
		dataset,
	},
});
