import { ipcRenderer } from 'electron';
import { ThunkAction } from 'redux-thunk';
import { IEngineDevStatusAction, IEngineStartedAction } from './model/actionTypes';
import { ENGINE_STARTED, ENGINE_DEV_STATUS } from '_state/types';

export const notifyEngineStarted = (): IEngineStartedAction => {
	return {
		type: ENGINE_STARTED,
	};
};

export const getDevReloadEngineStatus = (): ThunkAction<
	void,
	{},
	undefined,
	IEngineDevStatusAction
> => async (dispatch) => {
	const engineStarted = (await ipcRenderer.invoke('engine-dev:started')) as boolean;
	dispatch({
		type: ENGINE_DEV_STATUS,
		payload: {
			engineStarted,
		},
	});
};
