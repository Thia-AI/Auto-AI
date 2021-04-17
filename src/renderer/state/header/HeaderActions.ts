import { HeaderMaximizeChangedAction } from './model/actionTypes';
import { APP_MAXIMIZE_CHANGE } from '_state/types';

export const changeHeaderMaximized = (
	maximized: boolean,
): HeaderMaximizeChangedAction => {
	return {
		type: APP_MAXIMIZE_CHANGE,
		payload: {
			maximized,
		},
	};
};
