import { ipcMain } from 'electron';
import Store from 'electron-store';
import {
	IPC_ACTIVITIES_STORE_ADD_ACTIVITY,
	IPC_ACTIVITIES_STORE_DELETE_ACTIVITY,
	IPC_NOTIFICATIONS_STORE_DELETE_ALL_ACTIVITIES,
	IPC_ACTIVITIES_STORE_GET_ACTIVITIES,
} from '_/shared/ipcChannels';
import { UseToastOptions } from '@chakra-ui/react';

/**
 * Notification that is stored with `electron-store`.
 */
export interface ElectronStoreActivity {
	title?: string;
	description?: string;
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
	private store: Store;
	constructor(store: Store) {
		this.store = store;
		this.initIPC();
	}

	/**
	 * Initializes all IPC events.
	 */
	initIPC = () => {
		ipcMain.handle(IPC_ACTIVITIES_STORE_GET_ACTIVITIES, () => {
			const notifications = this.store.get('notifications', []);
			return notifications;
		});

		ipcMain.handle(IPC_ACTIVITIES_STORE_ADD_ACTIVITY, (_, activityID, chakraNotification) => {
			this.addActivity(activityID, chakraNotification);
		});

		ipcMain.handle(IPC_ACTIVITIES_STORE_DELETE_ACTIVITY, (_, activityID) => {
			this.deleteActivity(activityID);
		});

		ipcMain.handle(IPC_NOTIFICATIONS_STORE_DELETE_ALL_ACTIVITIES, () => {
			this.deleteAllActivities();
		});
	};

	/**
	 * Adds an activity to the store.
	 *
	 * @param activityID Activity ID - UUIDv4.
	 * @param chakraNotification Notification coming from Chakra UI.
	 */
	addActivity = (activityID: string, chakraNotification: UseToastOptions) => {
		const electronStoreNotification: ElectronStoreActivity = {
			title: chakraNotification.title as string,
			description: chakraNotification.description as string,
			status: chakraNotification.status,
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
