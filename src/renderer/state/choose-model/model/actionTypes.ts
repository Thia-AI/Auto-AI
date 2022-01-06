import { CLICK_CHOOSE_MODEL_BUTTON, CHANGE_SELECTED_MODEL } from '_state/types';

/**
 * When we want to open the the modal for model selection.
 */
export interface IOpenCloseModelSelectionAction {
	type: typeof CLICK_CHOOSE_MODEL_BUTTON;
}

/**
 * When we want to change the currently selected model.
 */
export interface IChangeSelectedModelAction {
	type: typeof CHANGE_SELECTED_MODEL;
	payload: {
		selectedModelNumber: number;
	};
}
