import { ENGINE_STARTED, ENGINE_DEV_STATUS, ENGINE_STOPPED } from '_state/types';

/**
 * Action to be called once engine has started.
 */
export interface IEngineStartedAction {
	type: typeof ENGINE_STARTED;
}

/**
 * Action to be called once engine has stopped.
 */
export interface IEngineStoppedAction {
	type: typeof ENGINE_STOPPED;
}

/**
 * Action for checking the status of engine at any time (only used in development).
 */
export interface IEngineDevStatusAction {
	type: typeof ENGINE_DEV_STATUS;
	payload: {
		engineStarted: boolean;
	};
}
