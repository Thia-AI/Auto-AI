import { ENGINE_STARTED, ENGINE_DEV_STATUS } from '_state/types';

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
