import { IHeaderMaximizeChangedAction } from './model/actionTypes';
import { APP_MAXIMIZE_CHANGE } from '_state/types';

export const changeHeaderMaximized = (
	maximizedClass: string,
): IHeaderMaximizeChangedAction => {
	return {
		type: APP_MAXIMIZE_CHANGE,
		payload: {
			maximizedClass,
		},
	};
};
