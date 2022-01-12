import { Dispatch } from 'redux';
import { ThunkAction } from 'redux-thunk';
import { EngineActionHandler } from '_/renderer/engine-requests/engineActionHandler';
import {
	GET_NEXT_PAGE_INPUTS,
	GET_PREVIOUS_PAGE_INPUTS,
	RESET_ACTIVE_DATASET_INPUTS,
	SET_ACTIVE_DATASET_INPUTS_PREVIEW_ID,
	SET_NEXT_PAGE_CURSOR,
	SET_PREVIOUS_PAGE_CURSOR,
} from '_state/types';
import {
	IGetNextPageInputsAction,
	IGetPreviousPageInputsAction,
	IResetActiveDatasetInputsAction,
	ISetActiveDatasetInputsPreviewIDAction,
	ISetNextPageCursorAction,
	ISetPreviousPageCursorAction,
} from './model/actionTypes';

/**
 * Gets previous page dataset inputs using cursor pagination.
 *
 * @param datasetID Dataset ID to retrieve inputs from.
 * @param cursorDate Inputs before this date (encoded in base 64 format) are retrieved.
 * @ts
 */
export const getPreviousPageInputsAction =
	(datasetID: string, cursorDate: string): ThunkAction<void, {}, undefined, IGetPreviousPageInputsAction> =>
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	async (
		dispatch: Dispatch<
			| IGetPreviousPageInputsAction
			| ISetNextPageCursorAction
			| ISetPreviousPageCursorAction
			| ISetActiveDatasetInputsPreviewIDAction
		>,
		getState,
	) => {
		const [error, resData] = await EngineActionHandler.getInstance().getPreviousPage(datasetID, cursorDate);
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
			dispatch(setActiveDatasetInputsPreviewIDAction(resData['inputs'].length - 1));
			dispatch(setNextPageCursor(resData['next_cursor']));
			dispatch(setPreviousPageCursor(resData['previous_cursor']));
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
	(datasetID: string, cursorDate: string): ThunkAction<void, {}, undefined, IGetNextPageInputsAction> =>
	async (
		dispatch: Dispatch<
			| IGetNextPageInputsAction
			| ISetNextPageCursorAction
			| ISetPreviousPageCursorAction
			| ISetActiveDatasetInputsPreviewIDAction
		>,
		getState,
	) => {
		const [error, resData] = await EngineActionHandler.getInstance().getNextPage(datasetID, cursorDate);
		const state = getState();
		if (error) {
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
			dispatch(setActiveDatasetInputsPreviewIDAction(0));
			dispatch(setNextPageCursor(resData['next_cursor']));
			dispatch(setPreviousPageCursor(resData['previous_cursor']));
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
export const setActiveDatasetInputsPreviewIDAction = (previewID: number): ISetActiveDatasetInputsPreviewIDAction => ({
	type: SET_ACTIVE_DATASET_INPUTS_PREVIEW_ID,
	payload: {
		value: previewID,
	},
});

/**
 * Sets the next page cursor when retreiving the next/previous page.
 *
 * @ts
 */
export const setNextPageCursor = (nextPageCursor: string | null): ISetNextPageCursorAction => ({
	type: SET_NEXT_PAGE_CURSOR,
	payload: {
		value: nextPageCursor,
	},
});

/**
 * Sets the previous page cursor when retreiving the next/previous page.
 *
 * @ts
 */
export const setPreviousPageCursor = (previousPageCursor: string | null): ISetPreviousPageCursorAction => ({
	type: SET_PREVIOUS_PAGE_CURSOR,
	payload: {
		value: previousPageCursor,
	},
});
