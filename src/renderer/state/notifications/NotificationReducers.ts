import { NOTIFICATION_CLEAR, NOTIFICATION_DISMISS, NOTIFICATION_SEND } from '../types';
import { INotifClearAction, INotifDismissAction, INotifSendAction } from './model/actionTypes';
import { INotificationsReducer } from './model/reducerTypes';

// State for list of notifications
const initialNotificationsState: INotificationsReducer = {
	value: [],
};

export const notificationsReducer = (
	state = initialNotificationsState,
	action: INotifClearAction | INotifDismissAction | INotifSendAction,
): INotificationsReducer => {
	switch (action.type) {
		case NOTIFICATION_SEND:
			return {
				value: [
					action.payload,
					...state.value.filter((notification) => notification.id !== action.payload.id),
				],
			};
		case NOTIFICATION_DISMISS:
			return {
				value: state.value.filter((notification) => notification.id !== action.payload),
			};
		case NOTIFICATION_CLEAR:
			return {
				value: [],
			};
		default:
			return state;
	}
};
