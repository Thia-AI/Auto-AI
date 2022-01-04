import { IHeaderMaximizeChangedAction } from './model/actionTypes';
import { APP_MAXIMIZE_CHANGE } from '_state/types';

/**
 * Action for when App changes from maximized to unmaximized.
 *
 * @ts
 */
export const changeHeaderMaximized = (maximizedClass: string): IHeaderMaximizeChangedAction => ({
	type: APP_MAXIMIZE_CHANGE,
	payload: {
		maximizedClass,
	},
});
