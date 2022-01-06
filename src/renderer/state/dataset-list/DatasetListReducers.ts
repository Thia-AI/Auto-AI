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

const initialDatasetListState: IDatasetListReducer = {
	value: [],
};

/**
 * State for the list of datasets.
 *
 * @ts
 */
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

const initialDatasetListLoadingState: IDatasetListLoadingReducer = {
	value: false,
};

/**
 * State for whether dataset list is being loaded.
 *
 * @ts
 */
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

const initialDatasetPreviewFilesState: IDatasetPreviewFilesReducer = {
	value: [],
};

/**
 * State for dataset upload file preview.
 *
 * @ts
 */
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
