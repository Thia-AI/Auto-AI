import { IEngineDevStatusAction, IEngineStartedAction, IEngineStoppedAction } from './model/actionTypes';
import { IEngineStatusReducer } from './model/reducerTypes';
import { ENGINE_DEV_STATUS, ENGINE_STARTED, ENGINE_STOPPED } from '_state/types';

const initialEngineStatusState: IEngineStatusReducer = {
	value: false,
};

/**
 * State for the status of engine.
 *
 * @ts
 */
export const engineStatusReducer = (
	state = initialEngineStatusState,
	action: IEngineStartedAction | IEngineDevStatusAction | IEngineStoppedAction,
): IEngineStatusReducer => {
	switch (action.type) {
		case ENGINE_STARTED:
			return {
				value: true,
			};
		case ENGINE_STOPPED:
			return {
				value: false,
			};
		case ENGINE_DEV_STATUS:
			return {
				value: action.payload.engineStarted,
			};
		default:
			return state;
	}
};
