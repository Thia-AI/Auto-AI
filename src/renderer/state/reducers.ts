import { combineReducers } from 'redux';

import engineStatusReducer from './engine-status/EngineStatusReducers';
import { EngineStatusReducerType } from './engine-status/model/reducerTypes';

// define the root reducer
const rootReducer = combineReducers({
	engineStarted: engineStatusReducer,
});

// define the state of the App
export interface IAppState {
	engineStarted: EngineStatusReducerType;
}

export default rootReducer;
