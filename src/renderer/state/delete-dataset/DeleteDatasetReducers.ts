import { OPEN_CLOSE_DELETE_DATASET } from '../types';
import { IOpenCloseDeleteDatasetReducer } from './model/reducerTypes';
import { IOpenCloseDeleteDatasetAction } from './model/actionTypes';
import { nullDataset } from '_/renderer/view/helpers/constants/engineDBTypes';

const initialOpenCloseDeleteDatasetSelectionState: IOpenCloseDeleteDatasetReducer = {
	openCloseValue: false,
	datasetValue: nullDataset,
};

// State for whether the delete dataset dialog is open or not along with
// the dataset it should display
export const openCloseDeleteDatasetReducer = (
	state = initialOpenCloseDeleteDatasetSelectionState,
	action: IOpenCloseDeleteDatasetAction,
): IOpenCloseDeleteDatasetReducer => {
	switch (action.type) {
		case OPEN_CLOSE_DELETE_DATASET:
			return {
				openCloseValue: !state.openCloseValue,
				datasetValue: action.payload.dataset,
			};
		default:
			return state;
	}
};
