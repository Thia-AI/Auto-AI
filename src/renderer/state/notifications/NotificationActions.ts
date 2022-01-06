import { ThunkAction } from 'redux-thunk';
import { NOTIFICATION_DISMISS, NOTIFICATION_CLEAR, NOTIFICATION_SEND } from '../types';
import {
	INotifSendAction,
	INotifDismissAction,
	INotifClearAction,
	IJobNotification,
} from './model/actionTypes';

/**
 * When we want to send a notification.
 *
 * @ts
 */
export const notifSendAction = (
	notification: IJobNotification,
): ThunkAction<void, {}, undefined, INotifSendAction> => {
	if (!notification.id) {
		notification.id = new Date().getTime();
	}
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	return async (dispatch: any) => {
		dispatch({
			type: NOTIFICATION_SEND,
			payload: notification,
		});

		if (notification.dismissAfter) {
			setTimeout(() => {
				// ID may be undefined (to the compiler) but it won't ever be
				// because we set it above
				dispatch(notifDismissAction(notification.id!));
			}, notification.dismissAfter);
		}
	};
};

/**
 * When we want to dismiss a notification given it's id.
 *
 * @ts
 */
export const notifDismissAction = (id: number): INotifDismissAction => ({
	type: NOTIFICATION_DISMISS,
	payload: id,
});

/**
 * When we want to clear all notifications.
 *
 * @ts
 */
export const notifClearAction = (): INotifClearAction => ({
	type: NOTIFICATION_CLEAR,
});
