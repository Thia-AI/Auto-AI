import { ipcRenderer } from 'electron';
import { ThunkAction } from 'redux-thunk';
import { EngineDevStatusAction, EngineStartedAction } from './model/actionTypes';

export const listenForEngineStart = (): EngineStartedAction => {
	return {
		type: 'ENGINE_STARTED',
	};
};

export const getDevReloadEngineStatus = (): ThunkAction<
	void,
	{},
	undefined,
	EngineDevStatusAction
> => async (dispatch) => {
	const engineStarted = (await ipcRenderer.invoke('engine-dev:started')) as boolean;
	dispatch({
		type: 'ENGINE_DEV_STATUS',
		payload: {
			engineStarted,
		},
	});
};
