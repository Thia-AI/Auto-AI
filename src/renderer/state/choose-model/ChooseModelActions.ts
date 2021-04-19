import { CLICK_CHOOSE_MODEL_BUTTON, CHANGE_SELECTED_MODEL } from '_state/types';
import {
	IChangeSelectedModelAction,
	IOpenCloseModelSelectionAction,
} from './model/actionTypes';

export const openCloseModelSelectionAction = (): IOpenCloseModelSelectionAction => {
	return {
		type: CLICK_CHOOSE_MODEL_BUTTON,
	};
};

export const changeSelectedModel = (modelNumber: number): IChangeSelectedModelAction => {
	return {
		type: CHANGE_SELECTED_MODEL,
		payload: {
			selectedModelNumber: modelNumber,
		},
	};
};
