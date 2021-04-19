import { CLICK_CHOOSE_MODEL_BUTTON } from '../types';
import { IOpenCloseModelSelectionAction } from './model/actionTypes';
import { IOpenCloseModelSelectionReducer } from './model/reducerTypes';

const initialOpenCloseModelSelectionState: IOpenCloseModelSelectionReducer = {
	value: false,
};

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
