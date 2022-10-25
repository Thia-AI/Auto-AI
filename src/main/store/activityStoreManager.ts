import { ipcMain } from 'electron';
import Store from 'electron-store';
import {
	IPC_ACTIVITIES_STORE_ADD_ACTIVITY,
	IPC_ACTIVITIES_STORE_DELETE_ACTIVITY,
	IPC_NOTIFICATIONS_STORE_DELETE_ALL_ACTIVITIES,
	IPC_ACTIVITIES_STORE_GET_ACTIVITIES,
} from '_/shared/ipcChannels';
import { UseToastOptions } from '@chakra-ui/react';
import { NOTIFICATIONS_STORE_FILENAME, STORE_ENCRYPTION_KEY } from '_/shared/appConstants';
import { ToastOptions } from '_/renderer/view/helpers/functionHelpers';

/**
 * Notification that is stored with `electron-store`.
 */
export interface ElectronStoreActivity {
	title?: string;
	// TODO: Description should only be a string. Create function to extract all error responses from an error message
	description?: string | { [key: string]: string[] };
	status?: UseToastOptions['status'];
	id: string;
	dateNow: number;
}

/**
 * Map of how notifications are stored.
 */
export interface ElectronStoreActivityMap {
	[notificationID: string]: ElectronStoreActivity;
}

/**
 * Type guard (predicate) for {@link ElectronStoreActivity `ElectronStoreNotification`} array.
 *
 * @param a What you are verifying the type of.
 * @returns True if parameter `a` is a {@link ElectronStoreActivity `ElectronStoreNotification`} array.
 */
export const isElectronStoreActivityArrayTypeGuard = (
	a: ElectronStoreActivityMap | ElectronStoreActivity[],
): a is ElectronStoreActivity[] => {
	return (a as ElectronStoreActivity[]).length !== undefined;
};

/**
 * Manager for notifications stored with `electron-store`.
 */
export class ActivityStoreManager {
	private store!: Store;

	constructor() {
		this.initIPC();
	}

	/**
	 * Initializes `electron-store` store if not already.
	 *
	 * @param uid Firebase user's `uid`.
	 * @param reInitStore Whether to re-initialize store.
	 */
	private initStoreIfNotInitialized = (uid: string, reInitStore?: boolean) => {
		if (!this.store || reInitStore) {
			this.store = new Store({
				name: uid + '-' + NOTIFICATIONS_STORE_FILENAME,
				encryptionKey: STORE_ENCRYPTION_KEY,
			});
		}
	};

	/**
	 * Initializes all IPC events.
	 */
	initIPC = () => {
		ipcMain.handle(IPC_ACTIVITIES_STORE_GET_ACTIVITIES, (_, uid: string) => {
			if (!uid) throw new Error('UID not specified when accessing recent activities');
			this.initStoreIfNotInitialized(uid);
			const notifications = this.store.get('notifications', []);
			return notifications;
		});

		ipcMain.handle(IPC_ACTIVITIES_STORE_ADD_ACTIVITY, (_, activityID, uid: string, notification: ToastOptions) => {
			if (!uid) throw new Error('UID not specified when accessing recent activities');
			this.initStoreIfNotInitialized(uid, notification.reInitStore);
			if (notification.saveToStore) {
				this.addActivity(activityID, notification);
			}
		});

		ipcMain.handle(IPC_ACTIVITIES_STORE_DELETE_ACTIVITY, (_, activityID, uid: string) => {
			if (!uid) throw new Error('UID not specified when accessing recent activities');
			this.initStoreIfNotInitialized(uid);
			this.deleteActivity(activityID);
		});

		ipcMain.handle(IPC_NOTIFICATIONS_STORE_DELETE_ALL_ACTIVITIES, (_, uid: string) => {
			if (!uid) throw new Error('UID not specified when accessing recent activities');
			this.initStoreIfNotInitialized(uid);
			this.deleteAllActivities();
		});
	};

	/**
	 * Adds an activity to the store.
	 *
	 * @param activityID Activity ID - UUIDv4.
	 * @param notification Notification coming from renderer.
	 */
	addActivity = (activityID: string, notification: ToastOptions) => {
		const electronStoreNotification: ElectronStoreActivity = {
			title: notification.title as string,
			description: notification.description as string,
			status: notification.status,
			id: activityID,
			dateNow: Date.now(),
		};
		this.store.set(`notifications.${electronStoreNotification.id}`, electronStoreNotification);
	};

	/**
	 * Deletes a notification from the store.
	 *
	 * @param activityID Activity ID coming from **Renderer**.
	 */
	deleteActivity = (activityID: string) => {
		this.store.delete(`notifications.${activityID}`);
	};

	/**
	 * Deletes all notifications from the store.
	 */
	deleteAllActivities = () => {
		this.store.delete('notifications');
	};
}
