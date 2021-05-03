import { IHeaderMaximizedChangedReducer } from './model/reducerTypes';
import { IHeaderMaximizeChangedAction } from './model/actionTypes';
import { APP_MAXIMIZE_CHANGE } from '_state/types';

const initialHeaderMaximizedState: IHeaderMaximizedChangedReducer = {
	value: '',
};

// State for maximized class for maximized header button
export const headerMaximizedChangedReducer = (
	state = initialHeaderMaximizedState,
	action: IHeaderMaximizeChangedAction,
): IHeaderMaximizedChangedReducer => {
	switch (action.type) {
		case APP_MAXIMIZE_CHANGE:
			return {
				value: action.payload.maximizedClass,
			};
		default:
			return state;
	}
};
