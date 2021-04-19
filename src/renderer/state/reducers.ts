import { combineReducers } from 'redux';

import { engineStatusReducer } from './engine-status/EngineStatusReducers';
import { IEngineStatusReducer } from './engine-status/model/reducerTypes';
import { headerMaximizedChangedReducer } from './header/HeaderReducers';
import { IHeaderMaximizedChangedReducer } from './header/model/reducerTypes';

// define the root reducer
const rootReducer = combineReducers({
	engineStarted: engineStatusReducer,
	headerMaximizedClass: headerMaximizedChangedReducer,
});

// define the state of the App
export interface IAppState {
	engineStarted: IEngineStatusReducer;
	headerMaximizedClass: IHeaderMaximizedChangedReducer;
}

export default rootReducer;
