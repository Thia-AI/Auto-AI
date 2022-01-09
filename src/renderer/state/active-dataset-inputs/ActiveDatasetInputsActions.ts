import { AxiosError } from 'axios';
import { Dispatch } from 'redux';
import { ThunkAction } from 'redux-thunk';
import { EngineActionHandler } from '_/renderer/engine-requests/engineActionHandler';
import {
	GET_NEXT_PAGE_INPUTS,
	GET_PREVIOUS_PAGE_INPUTS,
	RESET_ACTIVE_DATASET_INPUTS,
	SET_ACTIVE_DATASET_INPUTS_PREVIEW_ID,
} from '_state/types';
import {
	IGetNextPageInputsAction,
	IGetPreviousPageInputsAction,
	IResetActiveDatasetInputsAction,
	ISetActiveDatasetInputsPreviewIDAction,
} from './model/actionTypes';

/**
 * Gets previous page dataset inputs using cursor pagination.
 *
 * @param datasetID Dataset ID to retrieve inputs from.
 * @param cursorDate Inputs before this date (encoded in base 64 format) are retrieved.
 * @ts
 */
export const getPreviousPageInputsAction =
	(
		datasetID: string,
		cursorDate: string,
	): ThunkAction<void, {}, undefined, IGetPreviousPageInputsAction> =>
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	async (dispatch: Dispatch<IGetPreviousPageInputsAction>, getState) => {
		const [error, resData] = await EngineActionHandler.getInstance().getPreviousPage(
			datasetID,
			cursorDate,
		);
		const state = getState();
		if (error) {
			dispatch({
				type: GET_PREVIOUS_PAGE_INPUTS,
				payload: {
					inputs: state['datasetList'],
				},
			});
		} else {
			dispatch({
				type: GET_PREVIOUS_PAGE_INPUTS,
				payload: {
					inputs: resData['inputs'],
				},
			});
		}
	};

/**
 * Gets next page dataset inputs using cursor pagination.
 *
 * @param datasetID Dataset ID to retrieve inputs from.
 * @param cursorDate Inputs after this date (encoded in base 64 format) are retrieved.
 * @ts
 */
export const getNextPageInputsAction =
	(
		datasetID: string,
		cursorDate: string,
	): ThunkAction<void, {}, undefined, IGetNextPageInputsAction> =>
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	async (dispatch: Dispatch<IGetNextPageInputsAction>, getState) => {
		const [error, resData] = await EngineActionHandler.getInstance().getNextPage(
			datasetID,
			cursorDate,
		);
		const state = getState();
		if (error) {
			const errorData = resData as AxiosError;
			console.log(errorData);
			dispatch({
				type: GET_NEXT_PAGE_INPUTS,
				payload: {
					inputs: state['datasetList'],
				},
			});
		} else {
			dispatch({
				type: GET_NEXT_PAGE_INPUTS,
				payload: {
					inputs: resData['inputs'],
				},
			});
		}
	};

/**
 * Resets the active dataset inputs.
 *
 * @ts
 */
export const resetActiveDatasetInputsAction = (): IResetActiveDatasetInputsAction => ({
	type: RESET_ACTIVE_DATASET_INPUTS,
});

/**
 * Sets the active dataset input ID (index) that is displayed on the larger preview.
 *
 * @param previewID ID (index) of the input to be previewed.
 * @ts
 */
export const setActiveDatasetInputsPreviewIDAction = (
	previewID: number,
): ISetActiveDatasetInputsPreviewIDAction => ({
	type: SET_ACTIVE_DATASET_INPUTS_PREVIEW_ID,
	payload: {
		value: previewID,
	},
});
