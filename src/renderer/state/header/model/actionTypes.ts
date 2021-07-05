import { APP_MAXIMIZE_CHANGE } from '_state/types';

// Action for when App changes from maximized to unmaximized
export interface IHeaderMaximizeChangedAction {
	type: typeof APP_MAXIMIZE_CHANGE;
	payload: {
		maximizedClass: string;
	};
}
