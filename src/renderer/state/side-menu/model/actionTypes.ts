import { OPEN_CLOSE_SIDE_MENU, CHANGE_SELECTED_PAGE } from '_state/types';

// Action to open/close side menu
export interface IMenuOpenCloseAction {
	type: typeof OPEN_CLOSE_SIDE_MENU;
}

// Action to change selected page
export interface IChangeSelectedPageAction {
	type: typeof CHANGE_SELECTED_PAGE;
	payload: {
		newPage: number;
	};
}
