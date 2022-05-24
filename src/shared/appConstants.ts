import { browserLocalPersistence, browserSessionPersistence, Persistence } from 'firebase/auth';

/**
 * Used for app to let Login renderer know that the login workflow has completed.
 */
export const LOGIN_WINDOW_LOGIN_WORKFLOW_COMPLETE = 'loginWindow:loginWorkflowComplete';

export const NOTIFICATIONS_STORE_FILENAME = 'notifications';

export const STORE_ENCRYPTION_KEY = 'hWmZq4t7w!z%C*F-JaNdRgUkXn2r5u8x';

/**
 * Different type of login persistence.
 * 'local' = Saved even after app is terminated.
 * 'session' = Saved for the duration of the app.
 */
export type PERSISTENCE_TYPE = 'local' | 'session';

type PersistenceMap = {
	[key in PERSISTENCE_TYPE]: Persistence;
};

export const persistenceMap: PersistenceMap = {
	local: browserLocalPersistence,
	session: browserSessionPersistence,
};
