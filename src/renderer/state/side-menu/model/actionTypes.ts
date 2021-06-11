import { OPEN_CLOSE_SIDE_MENU } from '_state/types';

// Action to open/close side menu
export interface IMenuOpenCloseAction {
	type: typeof OPEN_CLOSE_SIDE_MENU;
}

export type SideModelActionTypes = IMenuOpenCloseAction;
