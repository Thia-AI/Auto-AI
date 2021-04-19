import { CLICK_CHOOSE_MODEL_BUTTON } from '_state/types';
import { IOpenCloseModelSelectionAction } from './model/actionTypes';

export const openCloseModelSelectionAction = (): IOpenCloseModelSelectionAction => {
	return {
		type: CLICK_CHOOSE_MODEL_BUTTON,
	};
};
