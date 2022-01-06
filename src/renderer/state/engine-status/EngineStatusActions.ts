import { ipcRenderer } from 'electron';
import { ThunkAction } from 'redux-thunk';
import { IEngineDevStatusAction, IEngineStartedAction } from './model/actionTypes';
import { ENGINE_STARTED, ENGINE_DEV_STATUS } from '_state/types';
import { IPC_DEV_ENGINE_STARTED } from '_/shared/ipcChannels';

/**
 * Action to be called once engine has started.
 *
 * @ts
 */
export const notifyEngineStarted = (): IEngineStartedAction => ({
	type: ENGINE_STARTED,
});

/**
 * Action for checking the status of engine at any time (only used in development).
 *
 * @ts
 */
export const getDevEngineStatus =
	(): ThunkAction<void, {}, undefined, IEngineDevStatusAction> => async (dispatch) => {
		const engineStarted = (await ipcRenderer.invoke(IPC_DEV_ENGINE_STARTED)) as boolean;
		dispatch({
			type: ENGINE_DEV_STATUS,
			payload: {
				engineStarted,
			},
		});
	};
