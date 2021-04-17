import { combineReducers } from 'redux';

import engineStatusReducer from './engine-status/EngineStatusReducers';
import { IEngineStatusReducer } from './engine-status/model/reducerTypes';

// define the root reducer
const rootReducer = combineReducers({
	engineStarted: engineStatusReducer,
});

// define the state of the App
export interface IAppState {
	engineStarted: IEngineStatusReducer;
}

export default rootReducer;
