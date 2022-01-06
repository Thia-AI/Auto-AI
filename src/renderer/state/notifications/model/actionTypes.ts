import { Job } from '_/renderer/view/helpers/constants/engineDBTypes';
import { NOTIFICATION_DISMISS, NOTIFICATION_SEND, NOTIFICATION_CLEAR } from '../../types';

/**
 * When we want to send a notification.
 */
export interface INotifSendAction {
	type: typeof NOTIFICATION_SEND;
	payload: IJobNotification;
}

/**
 * When we want to dismiss a notification given its ID.
 */
export interface INotifDismissAction {
	type: typeof NOTIFICATION_DISMISS;
	payload: number;
}

/**
 * When we want to clear all notifications.
 */
export interface INotifClearAction {
	type: typeof NOTIFICATION_CLEAR;
}

/**
 * Form factor of what a notification contains.
 */
export interface IJobNotification {
	id?: number;
	job: Job;
	dismissAfter: number;
}
