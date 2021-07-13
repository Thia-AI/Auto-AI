import { Dataset } from '_/renderer/view/helpers/constants/engineDBTypes';

// State for the list of datasets
export interface IDatasetListReducer {
	value: Dataset[];
}

// State for whether dataset list is being loaded
export interface IDatasetListLoadingReducer {
	value: boolean;
}

// State for dataset upload file preview
export interface IDatasetPreviewFilesReducer {
	value: string[];
}
