import { IHeaderMaximizeChangedAction } from './model/actionTypes';
import { APP_MAXIMIZE_CHANGE } from '_state/types';

// Action for when App changes from maximized to unmaximized
export const changeHeaderMaximized = (maximizedClass: string): IHeaderMaximizeChangedAction => {
	return {
		type: APP_MAXIMIZE_CHANGE,
		payload: {
			maximizedClass,
		},
	};
};
