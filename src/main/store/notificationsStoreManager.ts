import { ipcMain } from 'electron';
import Store from 'electron-store';
import {
	IPC_NOTIFICATIONS_STORE_ADD_NOTIFICATION,
	IPC_NOTIFICATIONS_STORE_DELETE_NOTIFICATION,
	IPC_NOTIFICATIONS_STORE_DELETE_NOTIFICATIONS,
	IPC_NOTIFICATIONS_STORE_GET_NOTIFICATIONS,
} from '_/shared/ipcChannels';
import { UseToastOptions } from '@chakra-ui/react';

/**
 * Notification that is stored with `electron-store`.
 */
export interface ElectronStoreNotification {
	title?: string;
	description?: string;
	status?: UseToastOptions['status'];
	id?: string;
	dateNow: number;
}

/**
 * Map of how notifications are stored.
 */
export interface ElectronStoreNotificationMap {
	[notificationID: string]: ElectronStoreNotification;
}

/**
 * Type guard (predicate) for {@link ElectronStoreNotification `ElectronStoreNotification`} array.
 *
 * @param a What you are verifying the type of.
 * @returns True if parameter `a` is a {@link ElectronStoreNotification `ElectronStoreNotification`} array.
 */
export const isElectronStoreNotificationArrayTypeGuard = (
	a: ElectronStoreNotificationMap | ElectronStoreNotification[],
): a is ElectronStoreNotification[] => {
	return (a as ElectronStoreNotification[]).length !== undefined;
};

/**
 * Manager for notifications stored with `electron-store`.
 */
export class NotificationsStoreManager {
	private store: Store;
	constructor(store: Store) {
		this.store = store;
		this.initIPC();
	}

	/**
	 * Initializes all IPC events.
	 */
	initIPC = () => {
		ipcMain.handle(IPC_NOTIFICATIONS_STORE_GET_NOTIFICATIONS, () => {
			const notifications = this.store.get('notifications', []);
			return notifications;
		});

		ipcMain.handle(IPC_NOTIFICATIONS_STORE_ADD_NOTIFICATION, (_, notificationID, chakraNotification) => {
			this.addNotification(notificationID, chakraNotification);
		});

		ipcMain.handle(IPC_NOTIFICATIONS_STORE_DELETE_NOTIFICATION, (_, notificationID) => {
			this.deleteNotification(notificationID);
		});

		ipcMain.handle(IPC_NOTIFICATIONS_STORE_DELETE_NOTIFICATIONS, () => {
			this.deleteNotifications();
		});
	};

	/**
	 * Adds a notification to the store.
	 *
	 * @param notificationID Notification ID - UUIDv4.
	 * @param chakraNotification Notification coming from Chakra UI.
	 */
	addNotification = (notificationID: string, chakraNotification: UseToastOptions) => {
		const electronStoreNotification: ElectronStoreNotification = {
			title: chakraNotification.title as string,
			description: chakraNotification.description as string,
			status: chakraNotification.status,
			id: notificationID,
			dateNow: Date.now(),
		};
		this.store.set(`notifications.${electronStoreNotification.id}`, electronStoreNotification);
	};

	/**
	 * Deletes a notification from the store.
	 *
	 * @param notificationID Notification ID coming from **Renderer**.
	 */
	deleteNotification = (notificationID: string) => {
		this.store.delete(`notifications.${notificationID}`);
	};

	/**
	 * Deletes all notifications from the store.
	 */
	deleteNotifications = () => {
		this.store.delete('notifications');
	};
}
