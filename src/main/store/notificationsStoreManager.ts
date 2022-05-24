import { ipcMain } from 'electron';
import Store from 'electron-store';
import {
	IPC_NOTIFICATIONS_STORE_ADD_NOTIFICATION,
	IPC_NOTIFICATIONS_STORE_DELETE_NOTIFICATION,
	IPC_NOTIFICATIONS_STORE_DELETE_NOTIFICATIONS,
	IPC_NOTIFICATIONS_STORE_GET_NOTIFICATIONS,
	IPC_NOTIFICATIONS_STORE_RECEIVING_NOTIFICATIONS,
} from '_/shared/ipcChannels';
import { chakra, ToastId, UseToastOptions } from '@chakra-ui/react';

export interface ElectronStoreNotification {
	title?: string;
	description?: string;
	status?: UseToastOptions['status'];
	id?: UseToastOptions['id'];
	dateNow: number;
}

export class NotificationsStoreManager {
	private store: Store;
	constructor(store: Store) {
		this.store = store;
	}

	initIPC = () => {
		ipcMain.on(IPC_NOTIFICATIONS_STORE_GET_NOTIFICATIONS, (e) => {
			const notifications = this.store.get('notifications', []);
			e.sender.send(IPC_NOTIFICATIONS_STORE_RECEIVING_NOTIFICATIONS, notifications);
		});

		ipcMain.on(IPC_NOTIFICATIONS_STORE_ADD_NOTIFICATION, (e, chakraNotification) => {
			this.addNotification(chakraNotification);
		});

		ipcMain.on(IPC_NOTIFICATIONS_STORE_DELETE_NOTIFICATION, (e, notificationID) => {
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
