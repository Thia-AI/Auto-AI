import { CHANGE_SELECTED_DATASET, RESET_SELECTED_DATASET } from '_state/types';
import { IChangeSelectedDatasetAction, IResetSelectedDatasetAction } from './model/actionTypes';

/**
 * When we want to change the currently selected dataset to train.
 *
 * @ts
 */
export const changeSelectedDatasetAction = (
	selectedDatasetID: string,
): IChangeSelectedDatasetAction => {
	return {
		type: CHANGE_SELECTED_DATASET,
		payload: {
			selectedDatasetID,
		},
	};
};

/**
 * When we want to reset the currently selected dataset.
 *
 * @ts
 */
export const resetSelectedDatasetAction = (): IResetSelectedDatasetAction => ({
	type: RESET_SELECTED_DATASET,
});
