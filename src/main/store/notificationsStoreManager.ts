import { ipcMain } from 'electron';
import Store from 'electron-store';
import {
	IPC_NOTIFICATIONS_STORE_ADD_NOTIFICATION,
	IPC_NOTIFICATIONS_STORE_DELETE_NOTIFICATION,
	IPC_NOTIFICATIONS_STORE_DELETE_NOTIFICATIONS,
	IPC_NOTIFICATIONS_STORE_GET_NOTIFICATIONS,
} from '_/shared/ipcChannels';
import { ToastId, UseToastOptions } from '@chakra-ui/react';

/**
 * Notification that is stored with `electron-store`.
 */
export interface ElectronStoreNotification {
	title?: string;
	description?: string;
	status?: UseToastOptions['status'];
	id?: UseToastOptions['id'];
	dateNow: number;
}

/**
 * Manager for notifications stored with `electron-store`.
 */
export class NotificationsStoreManager {
	private store: Store;
	constructor(store: Store) {
		this.store = store;
	}

	initIPC = () => {
		ipcMain.on(IPC_NOTIFICATIONS_STORE_GET_NOTIFICATIONS, () => {
			const notifications = this.store.get('notifications', []);
			return notifications;
		});

		ipcMain.on(IPC_NOTIFICATIONS_STORE_ADD_NOTIFICATION, (_, chakraNotification) => {
			this.addNotification(chakraNotification);
		});

		ipcMain.on(IPC_NOTIFICATIONS_STORE_DELETE_NOTIFICATION, (_, notificationID) => {
			this.deleteNotification(notificationID);
		});

		ipcMain.on(IPC_NOTIFICATIONS_STORE_DELETE_NOTIFICATIONS, () => {
			this.deleteNotifications();
		});
	};

	addNotification = (chakraNotification: UseToastOptions) => {
		const electronStoreNotification: ElectronStoreNotification = {
			title: chakraNotification.title as string,
			description: chakraNotification.description as string,
			status: chakraNotification.status,
			id: chakraNotification.id,
			dateNow: Date.now(),
		};
		this.store.set(`notifications.${electronStoreNotification.id}`, electronStoreNotification);
	};

	deleteNotification = (notificationID: ToastId) => {
		this.store.delete(`notifications.${notificationID}`);
	};

	deleteNotifications = () => {
		this.store.delete('notifications');
	};
}
