import { combineReducers } from 'redux';
import { openCloseModelSelectionReducer } from './choose-model/ChooseModelReducers';
import { IOpenCloseModelSelectionReducer } from './choose-model/model/reducerTypes';

import { engineStatusReducer } from './engine-status/EngineStatusReducers';
import { IEngineStatusReducer } from './engine-status/model/reducerTypes';
import { headerMaximizedChangedReducer } from './header/HeaderReducers';
import { IHeaderMaximizedChangedReducer } from './header/model/reducerTypes';

// define the root reducer
const rootReducer = combineReducers({
	engineStarted: engineStatusReducer,
	headerMaximizedClass: headerMaximizedChangedReducer,
	openCloseModelSelection: openCloseModelSelectionReducer,
});

// define the state of the App
export interface IAppState {
	engineStarted: IEngineStatusReducer;
	headerMaximizedClass: IHeaderMaximizedChangedReducer;
	openCloseModelSelection: IOpenCloseModelSelectionReducer;
}

export default rootReducer;
