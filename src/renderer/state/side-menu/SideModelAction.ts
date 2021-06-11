import { OPEN_CLOSE_SIDE_MENU } from '../types';
import { IMenuOpenCloseAction } from './model/actionTypes';

// Action to open/close side menu
export const openCloseSideMenu = (): IMenuOpenCloseAction => {
	return {
		type: OPEN_CLOSE_SIDE_MENU,
	};
};
