import { Dataset } from '_/renderer/view/helpers/constants/engineDBTypes';

/**
 * State for whether the delete dataset dialog is open or not along with the dataset it should display.
 */
export interface IOpenCloseDeleteDatasetReducer {
	datasetValue: Dataset;
	openCloseValue: boolean;
}

/**
 * State for whether delete label dialog is open or not along with the label it should display.
 */
export interface IOpenCloseDeleteLabelReducer {
	labelValue: string;
	openCloseValue: boolean;
}
