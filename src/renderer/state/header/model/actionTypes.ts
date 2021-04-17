import { APP_MAXIMIZE_CHANGE } from '_state/types';

export interface HeaderMaximizeChangedAction {
	type: typeof APP_MAXIMIZE_CHANGE;
	payload: {
		maximized: boolean;
	};
}
