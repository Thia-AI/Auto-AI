import { Dataset } from '_/renderer/view/helpers/constants/engineTypes';
import { DATASET_LOADING, REFRESH_DATASET_LIST, UPDATE_DATASET_PREVIEW_UPLOAD_FILES } from '../../types';

/**
 * When we want to refresh the datasets array.
 */
export interface IRefreshDatasetListAction {
	type: typeof REFRESH_DATASET_LIST;
	payload: {
		datasetList: Dataset[];
	};
}

/**
 * When we want to update the loading status for the dataset list.
 */
export interface ILoadingDatasetListAction {
	type: typeof DATASET_LOADING;
	payload: {
		loading: boolean;
	};
}

/**
 * When we want to update the files for dataset preview upload.
 */
export interface IUpdateDatasetPreviewFilesAction {
	type: typeof UPDATE_DATASET_PREVIEW_UPLOAD_FILES;
	payload: {
		files: string[];
	};
}
