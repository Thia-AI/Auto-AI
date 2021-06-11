import { IMenuOpenReducer } from './model/reducerTypes';
import { IMenuOpenCloseAction } from './model/actionTypes';
import { OPEN_CLOSE_SIDE_MENU } from '../types';

const initialOpenSideMenuState: IMenuOpenReducer = {
	value: false,
};

// State for whether the menu is opened or not
export const openSideMenuReducer = (
	state = initialOpenSideMenuState,
	action: IMenuOpenCloseAction,
): IMenuOpenReducer => {
	switch (action.type) {
		case OPEN_CLOSE_SIDE_MENU:
			return {
				value: !state.value,
			};
		default:
			return state;
	}
};
