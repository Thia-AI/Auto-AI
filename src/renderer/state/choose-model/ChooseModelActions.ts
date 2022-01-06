import { CLICK_CHOOSE_MODEL_BUTTON, CHANGE_SELECTED_MODEL } from '_state/types';
import { IChangeSelectedModelAction, IOpenCloseModelSelectionAction } from './model/actionTypes';

/**
 * When we want to open the the modal for model selection.
 *
 * @ts
 */
export const openCloseModelSelectionAction = (): IOpenCloseModelSelectionAction => ({
	type: CLICK_CHOOSE_MODEL_BUTTON,
});

/**
 * When we want to change the currently selected model.
 *
 * @ts
 */
export const changeSelectedModelAction = (modelNumber: number): IChangeSelectedModelAction => ({
	type: CHANGE_SELECTED_MODEL,
	payload: {
		selectedModelNumber: modelNumber,
	},
});
