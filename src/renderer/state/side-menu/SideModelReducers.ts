import { IMenuOpenReducer, ISelectedPageReducer } from './model/reducerTypes';
import { IMenuOpenCloseAction, IChangeSelectedPageAction } from './model/actionTypes';
import { OPEN_CLOSE_SIDE_MENU, CHANGE_SELECTED_PAGE } from '../types';

const initialOpenSideMenuState: IMenuOpenReducer = {
	value: false,
};

/**
 * State for whether the menu is opened or not.
 *
 * @ts
 */
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

const initialChangeSelectedPageState: ISelectedPageReducer = {
	value: 0,
};

/**
 * State for currently selected page.
 *
 * @ts
 */
export const changeSelectedPageReducer = (
	state = initialChangeSelectedPageState,
	action: IChangeSelectedPageAction,
): ISelectedPageReducer => {
	switch (action.type) {
		case CHANGE_SELECTED_PAGE:
			return {
				value: action.payload.newPage,
			};
		default:
			return state;
	}
};
