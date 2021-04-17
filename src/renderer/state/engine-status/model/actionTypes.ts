export const ENGINE_STARTED = 'ENGINE_STARTED';
export const ENGINE_DEV_STATUS = 'ENGINE_DEV_STATUS';

export interface IEngineStartedAction {
	type: typeof ENGINE_STARTED;
}

export interface IEngineDevStatusAction {
	type: typeof ENGINE_DEV_STATUS;
	payload: {
		engineStarted: boolean;
	};
}

export type EngineStatusActionTypes = IEngineStartedAction | IEngineDevStatusAction;
