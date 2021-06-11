import { ipcRenderer } from 'electron';
import { ThunkAction } from 'redux-thunk';
import { IEngineDevStatusAction, IEngineStartedAction } from './model/actionTypes';
import { ENGINE_STARTED, ENGINE_DEV_STATUS } from '_state/types';

// Action to be called once engine has started
export const notifyEngineStarted = (): IEngineStartedAction => {
	return {
		type: ENGINE_STARTED,
	};
};

// Action for checking the status of engine at any time (only used in development)
export const getDevEngineStatus =
	(): ThunkAction<void, {}, undefined, IEngineDevStatusAction> => async (dispatch) => {
		const engineStarted = (await ipcRenderer.invoke('engine-dev:started')) as boolean;
		dispatch({
			type: ENGINE_DEV_STATUS,
			payload: {
				engineStarted,
			},
		});
	};
