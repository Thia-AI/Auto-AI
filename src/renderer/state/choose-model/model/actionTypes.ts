import { CLICK_CHOOSE_MODEL_BUTTON, CHANGE_SELECTED_MODEL } from '_state/types';

export interface IOpenCloseModelSelectionAction {
	type: typeof CLICK_CHOOSE_MODEL_BUTTON;
}

export interface IChangeSelectedModelAction {
	type: typeof CHANGE_SELECTED_MODEL;
	payload: {
		selectedModelNumber: number;
	};
}

export type ChooseModelActions =
	| IOpenCloseModelSelectionAction
	| IChangeSelectedModelAction;
