import { OPEN_CLOSE_SIDE_MENU, CHANGE_SELECTED_PAGE } from '../types';
import { IChangeSelectedPageAction, IMenuOpenCloseAction } from './model/actionTypes';

/**
 * Action to open/close side menu.
 *
 * @ts
 */
export const openCloseSideMenu = (): IMenuOpenCloseAction => ({
	type: OPEN_CLOSE_SIDE_MENU,
});

/**
 * Action to change selected page.
 *
 * @ts
 */
export const changeSelectedPageAction = (pageNumber: number): IChangeSelectedPageAction => ({
	type: CHANGE_SELECTED_PAGE,
	payload: {
		newPage: pageNumber,
	},
});
