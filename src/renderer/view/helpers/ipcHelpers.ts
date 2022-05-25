import { UseToastOptions } from '@chakra-ui/react';
import { ipcRenderer } from 'electron';
import { ElectronStoreNotification, ElectronStoreNotificationMap } from '_/main/store/notificationsStoreManager';
import {
	IPC_NOTIFICATIONS_STORE_ADD_NOTIFICATION,
	IPC_NOTIFICATIONS_STORE_DELETE_NOTIFICATIONS,
	IPC_NOTIFICATIONS_STORE_GET_NOTIFICATIONS,
} from '_/shared/ipcChannels';

// Contains helper functions that invoke IPC methods from renderer->main

/**
 * Possible return types for getting all notifications.
 */
export type ReturnType = 'map' | 'arraySortedByDate' | 'array';

/**
 * Gets all notifications.
 *
 * @param returnType Return type for notifications, default is `array`.
 * @returns Notifications.
 */
export const getAllNotifications = async (
	returnType: ReturnType = 'array',
): Promise<ElectronStoreNotificationMap | ElectronStoreNotification[]> => {
	const notifications = (await ipcRenderer.invoke(
		IPC_NOTIFICATIONS_STORE_GET_NOTIFICATIONS,
	)) as ElectronStoreNotificationMap;

	switch (returnType) {
		case 'map':
			return notifications;
		case 'array': {
			const notificationsArr: ElectronStoreNotification[] = [];
			for (const key in notifications) {
				const notification = notifications[key];
				notificationsArr.push(notification);
			}
			return notificationsArr;
		}

		case 'arraySortedByDate': {
			const notificationsArr: ElectronStoreNotification[] = [];
			for (const key in notifications) {
				const notification = notifications[key];
				notificationsArr.push(notification);
			}
			notificationsArr.sort((a, b) => {
				return a.dateNow - b.dateNow;
			});
			return notificationsArr;
		}
	}
};

/**
 * Adds a notification to the notification `electron-store` by sending it to **main** via IPC to be added.
 *
 * @param notificationID Notification ID (UUIDv4).
 * @param notificationOptions Notification options (Chakra UI `ToastOptions`).
 */
export const addNotificationToStore = async (notificationID: string, notificationOptions?: UseToastOptions) => {
	await ipcRenderer.invoke(IPC_NOTIFICATIONS_STORE_ADD_NOTIFICATION, notificationID, notificationOptions);
};

/**
 * Clears all notifications in the notification `electron-store` by sending action ot **main** via IPC.
 */
export const clearNotifications = async () => {
	await ipcRenderer.invoke(IPC_NOTIFICATIONS_STORE_DELETE_NOTIFICATIONS);
};
