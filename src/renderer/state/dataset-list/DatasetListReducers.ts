import {
	DATASET_LOADING,
	REFRESH_DATASET_LIST,
	UPDATE_DATASET_PREVIEW_UPLOAD_FILES,
} from '../types';
import {
	IRefreshDatasetListAction,
	ILoadingDatasetListAction,
	IUpdateDatasetPreviewFilesAction,
} from './model/actionTypes';
import {
	IDatasetListLoadingReducer,
	IDatasetListReducer,
	IDatasetPreviewFilesReducer,
} from './model/reducerTypes';

// State for the list of datasets
const initialDatasetListState: IDatasetListReducer = {
	value: [],
};

export const datasetListReducer = (
	state = initialDatasetListState,
	action: IRefreshDatasetListAction,
): IDatasetListReducer => {
	switch (action.type) {
		case REFRESH_DATASET_LIST:
			return {
				value: action.payload.datasetList,
			};
		default:
			return state;
	}
};

// State for whether dataset list is being loaded
const initialDatasetListLoadingState: IDatasetListLoadingReducer = {
	value: false,
};

export const datasetListLoadingReducer = (
	state = initialDatasetListLoadingState,
	action: ILoadingDatasetListAction,
): IDatasetListLoadingReducer => {
	switch (action.type) {
		case DATASET_LOADING:
			return {
				value: action.payload.loading,
			};
		default:
			return state;
	}
};

// State for dataset upload file preview
const initialDatasetPreviewFilesState: IDatasetPreviewFilesReducer = {
	value: [],
};
export const datasetPreviewFilesReducer = (
	state = initialDatasetPreviewFilesState,
	action: IUpdateDatasetPreviewFilesAction,
): IDatasetPreviewFilesReducer => {
	switch (action.type) {
		case UPDATE_DATASET_PREVIEW_UPLOAD_FILES:
			return {
				value: action.payload.files,
			};
		default:
			return state;
	}
};
