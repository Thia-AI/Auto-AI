import { IEngineDevStatusAction, IEngineStartedAction } from './model/actionTypes';
import { IEngineStatusReducer } from './model/reducerTypes';

const initialEngineStatusState: IEngineStatusReducer = {
	value: false,
};

const engineStatusReducer = (
	state = initialEngineStatusState,
	action: IEngineStartedAction | IEngineDevStatusAction,
): IEngineStatusReducer => {
	switch (action.type) {
		case 'ENGINE_STARTED':
			return {
				value: true,
			};
		case 'ENGINE_DEV_STATUS':
			return {
				value: action.payload.engineStarted,
			};
		default:
			return state;
	}
};

export default engineStatusReducer;
