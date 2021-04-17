import { IHeaderMaximizedReducerType } from './model/reducerTypes';
import { HeaderMaximizeChangedAction } from './model/actionTypes';
import { APP_MAXIMIZE_CHANGE } from '_state/types';

const initialHeaderMaximizedState: IHeaderMaximizedReducerType = {
	value: false,
};

export const headerMaximizedReducer = (
	state = initialHeaderMaximizedState,
	action: HeaderMaximizeChangedAction,
): IHeaderMaximizedReducerType => {
	switch (action.type) {
		case APP_MAXIMIZE_CHANGE:
			return {
				value: action.payload.maximized,
			};
		default:
			return state;
	}
};
