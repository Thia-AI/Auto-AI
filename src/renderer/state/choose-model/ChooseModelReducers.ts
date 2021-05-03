import { CHANGE_SELECTED_MODEL, CLICK_CHOOSE_MODEL_BUTTON } from '../types';
import { IChangeSelectedModelAction, IOpenCloseModelSelectionAction } from './model/actionTypes';
import { IChangeSelectedModelReducer, IOpenCloseModelSelectionReducer } from './model/reducerTypes';

const initialOpenCloseModelSelectionState: IOpenCloseModelSelectionReducer = {
	value: false,
};

// State for whether model selection modal is opened or not
export const openCloseModelSelectionReducer = (
	state = initialOpenCloseModelSelectionState,
	action: IOpenCloseModelSelectionAction,
): IOpenCloseModelSelectionReducer => {
	switch (action.type) {
		case CLICK_CHOOSE_MODEL_BUTTON:
			return {
				value: !state.value,
			};
		default:
			return state;
	}
};

const initialChangeSelectedModelState: IChangeSelectedModelReducer = {
	value: 0,
};

// State for which model is selected (for description viewing)
export const changeSelectedModelReducer = (
	state = initialChangeSelectedModelState,
	action: IChangeSelectedModelAction,
): IChangeSelectedModelReducer => {
	switch (action.type) {
		case CHANGE_SELECTED_MODEL:
			return {
				value: action.payload.selectedModelNumber,
			};
		default:
			return state;
	}
};
