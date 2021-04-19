import { CLICK_CHOOSE_MODEL_BUTTON } from '_state/types';

export interface IOpenCloseModelSelectionAction {
	type: typeof CLICK_CHOOSE_MODEL_BUTTON;
}

export type ChooseModelActions = IOpenCloseModelSelectionAction;
