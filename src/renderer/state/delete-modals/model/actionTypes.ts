import { Dataset } from '_/renderer/view/helpers/constants/engineDBTypes';
import { OPEN_CLOSE_DELETE_DATASET, OPEN_CLOSE_DELETE_LABEL } from '../../types';

// When we want to open/close the delete dataset dialog
export interface IOpenCloseDeleteDatasetAction {
	type: typeof OPEN_CLOSE_DELETE_DATASET;
	payload: {
		dataset: Dataset;
	};
}

// When we want to open/close the delete label dialog
export interface IOpenCloseDeleteLabelAction {
	type: typeof OPEN_CLOSE_DELETE_LABEL;
	payload: {
		labelValue: string;
	};
}
