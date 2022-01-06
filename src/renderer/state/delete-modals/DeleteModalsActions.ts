import { Dataset } from '_/renderer/view/helpers/constants/engineDBTypes';
import { OPEN_CLOSE_DELETE_DATASET, OPEN_CLOSE_DELETE_LABEL } from '../types';
import { IOpenCloseDeleteDatasetAction, IOpenCloseDeleteLabelAction } from './model/actionTypes';

/**
 * When we want to open/close the delete dataset dialog.
 *
 * @ts
 */
export const openCloseDeleteDatasetAction = (dataset: Dataset): IOpenCloseDeleteDatasetAction => ({
	type: OPEN_CLOSE_DELETE_DATASET,
	payload: {
		dataset,
	},
});

/**
 * When we want to open/close the delete label dialog.
 *
 * @ts
 */
export const openCloseDeleteLabelAction = (labelValue: string): IOpenCloseDeleteLabelAction => ({
	type: OPEN_CLOSE_DELETE_LABEL,
	payload: {
		labelValue,
	},
});
