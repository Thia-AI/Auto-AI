import { EngineDevStatusAction, EngineStartedAction } from './model/actionTypes';
import { EngineStatusReducerType } from './model/reducerTypes';

const initialEngineStatusState: EngineStatusReducerType = {
	value: false,
};

const engineStatusReducer = (
	state = initialEngineStatusState,
	action: EngineStartedAction | EngineDevStatusAction,
): EngineStatusReducerType => {
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
