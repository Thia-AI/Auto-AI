import { CLICK_CHOOSE_MODEL_BUTTON, CHANGE_SELECTED_MODEL } from '_state/types';
import { IChangeSelectedModelAction, IOpenCloseModelSelectionAction } from './model/actionTypes';

// When we want to open the the modal for model selection
export const openCloseModelSelectionAction = (): IOpenCloseModelSelectionAction => {
	return {
		type: CLICK_CHOOSE_MODEL_BUTTON,
	};
};

// When we want to change the currently selected model
export const changeSelectedModelAction = (modelNumber: number): IChangeSelectedModelAction => {
	return {
		type: CHANGE_SELECTED_MODEL,
		payload: {
			selectedModelNumber: modelNumber,
		},
	};
};
