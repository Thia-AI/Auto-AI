import { ThunkAction } from 'redux-thunk';
import { EngineActionHandler } from '_/renderer/engine-requests/engineActionHandler';

import {
	DATASET_LOADING,
	REFRESH_DATASET_LIST,
	UPDATE_DATASET_PREVIEW_UPLOAD_FILES,
} from '../types';
import {
	ILoadingDatasetListAction,
	IRefreshDatasetListAction,
	IUpdateDatasetPreviewFilesAction,
} from './model/actionTypes';

// Action for when we want to refresh the datasets array
export const refreshDatasetListAction =
	(): ThunkAction<void, {}, undefined, IRefreshDatasetListAction> =>
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	async (dispatch: any, getState) => {
		dispatch(datasetListLoadingAction(true));
		const [error, resData] = await EngineActionHandler.getInstance().getDatasets();
		const state = getState();

		if (error) {
			dispatch({
				type: REFRESH_DATASET_LIST,
				payload: {
					datasetList: state['datasetList'],
				},
			});
		} else {
			dispatch({
				type: REFRESH_DATASET_LIST,
				payload: {
					datasetList: resData['datasets'],
				},
			});
		}
		dispatch(datasetListLoadingAction(false));
	};

// When we want to update the loading status for the dataset list
export const datasetListLoadingAction = (isDatasetLoading: boolean): ILoadingDatasetListAction => ({
	type: DATASET_LOADING,
	payload: {
		loading: isDatasetLoading,
	},
});

// When we want to update the files for dataset preview upload
export const updateDatasetPreviewFilesAction = (
	files: string[],
): IUpdateDatasetPreviewFilesAction => ({
	type: UPDATE_DATASET_PREVIEW_UPLOAD_FILES,
	payload: {
		files,
	},
});