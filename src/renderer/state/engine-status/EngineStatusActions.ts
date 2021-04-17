import { ipcRenderer } from 'electron';
import { ThunkAction } from 'redux-thunk';
import { IEngineDevStatusAction, IEngineStartedAction } from './model/actionTypes';

export const listenForEngineStart = (): IEngineStartedAction => {
	return {
		type: 'ENGINE_STARTED',
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
		type: 'ENGINE_DEV_STATUS',
		payload: {
			engineStarted,
		},
	});
};
