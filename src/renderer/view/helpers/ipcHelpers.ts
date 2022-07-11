import { ipcRenderer } from 'electron';
import { ElectronStoreActivity, ElectronStoreActivityMap } from '_/main/store/activityStoreManager';
import {
	IPC_ACTIVITIES_STORE_ADD_ACTIVITY,
	IPC_NOTIFICATIONS_STORE_DELETE_ALL_ACTIVITIES,
	IPC_ACTIVITIES_STORE_GET_ACTIVITIES,
	IPC_ACTIVITIES_STORE_DELETE_ACTIVITY,
} from '_/shared/ipcChannels';
import { ToastOptions } from './functionHelpers';

// Contains helper functions that invoke IPC methods from renderer->main

/**
 * Possible return types for getting all notifications.
 */
export type ReturnType = 'map' | 'arraySortedByDate' | 'array';

/**
 * Gets all activities.
 *
 * @param returnType Return type for activities, default is `array`.
 * @param uid Firebase user's `uid`.
 * @returns Activities.
 */
export const getAllActivities = async (
	returnType: ReturnType = 'array',
	uid: string,
): Promise<ElectronStoreActivityMap | ElectronStoreActivity[]> => {
	const activities = (await ipcRenderer.invoke(IPC_ACTIVITIES_STORE_GET_ACTIVITIES, uid)) as ElectronStoreActivityMap;

	switch (returnType) {
		case 'map':
			return activities;
		case 'array': {
			const activitiesArr: ElectronStoreActivity[] = [];
			for (const key in activities) {
				const notification = activities[key];
				activitiesArr.push(notification);
			}
			return activitiesArr;
		}

		case 'arraySortedByDate': {
			const activitiesArr: ElectronStoreActivity[] = [];
			for (const key in activities) {
				const notification = activities[key];
				activitiesArr.push(notification);
			}
			activitiesArr.sort((a, b) => {
				return b.dateNow - a.dateNow;
			});
			return activitiesArr;
		}
	}
};

/**
 * Adds a activity to the activity `electron-store` by sending it to **main** via IPC to be added.
 *
 * @param activityID Activity ID (UUIDv4).
 * @param activityOptions Activity options (Chakra UI `ToastOptions`).
 */
export const addNotificationToStore = async (activityID: string, activityOptions: ToastOptions) => {
	await ipcRenderer.invoke(IPC_ACTIVITIES_STORE_ADD_ACTIVITY, activityID, activityOptions.uid, activityOptions);
};

/**
 * Deletes all activities in the activity `electron-store` by sending action to **main** via IPC.
 *
 * @param uid Firebase user's `uid`.
 */
export const deleteAllActivities = async (uid: string) => {
	await ipcRenderer.invoke(IPC_NOTIFICATIONS_STORE_DELETE_ALL_ACTIVITIES, uid);
};

/**
 * Deletes activity in the activity `electron-store` by sending action to **main** via IPC.
 *
 * @param activityID Activity ID.
 * @param uid Firebase user's `uid`.
 */
export const deleteActivity = async (activityID: string, uid: string) => {
	await ipcRenderer.invoke(IPC_ACTIVITIES_STORE_DELETE_ACTIVITY, activityID, uid);
};
