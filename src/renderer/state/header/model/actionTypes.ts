import { APP_MAXIMIZE_CHANGE } from '_state/types';

export interface IHeaderMaximizeChangedAction {
	type: typeof APP_MAXIMIZE_CHANGE;
	payload: {
		maximizedClass: string;
	};
}

export type HeaderActionTypes = IHeaderMaximizeChangedAction;
