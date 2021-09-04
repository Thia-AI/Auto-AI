import { OPEN_CLOSE_DELETE_DATASET, OPEN_CLOSE_DELETE_LABEL } from '../types';
import { IOpenCloseDeleteDatasetReducer, IOpenCloseDeleteLabelReducer } from './model/reducerTypes';
import { IOpenCloseDeleteDatasetAction, IOpenCloseDeleteLabelAction } from './model/actionTypes';
import { nullDataset } from '_/renderer/view/helpers/constants/engineDBTypes';

// State for whether the delete dataset dialog is open or not along with
// the dataset it should display
const initialOpenCloseDeleteDatasetSelectionState: IOpenCloseDeleteDatasetReducer = {
	openCloseValue: false,
	datasetValue: nullDataset,
};

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

// State for whether delete label dialog is open or not along with
// the label it should display
const initialOpenCloseDeleteLabelSelectionState: IOpenCloseDeleteLabelReducer = {
	labelValue: '',
	openCloseValue: false,
};

export const openCloseDeleteLabelReducer = (
	state = initialOpenCloseDeleteLabelSelectionState,
	action: IOpenCloseDeleteLabelAction,
): IOpenCloseDeleteLabelReducer => {
	switch (action.type) {
		case OPEN_CLOSE_DELETE_LABEL:
			return {
				labelValue: action.payload.labelValue,
				openCloseValue: !state.openCloseValue,
			};
		default:
			return state;
	}
};