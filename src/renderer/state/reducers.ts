import { combineReducers } from 'redux';
import {
	selectedModelReducer,
	openCloseModelSelectionReducer,
} from './choose-model/ChooseModelReducers';
import {
	ISelectedModelReducer,
	IOpenCloseModelSelectionReducer,
} from './choose-model/model/reducerTypes';

import { engineStatusReducer } from './engine-status/EngineStatusReducers';
import { IEngineStatusReducer } from './engine-status/model/reducerTypes';
import { headerMaximizedChangedReducer } from './header/HeaderReducers';
import { IHeaderMaximizedChangedReducer } from './header/model/reducerTypes';
import { IMenuOpenReducer } from './side-menu/model/reducerTypes';
import { openSideMenuReducer } from './side-menu/SideModelReducers';

// define the root reducer
const rootReducer = combineReducers({
	engineStarted: engineStatusReducer,
	headerMaximizedClass: headerMaximizedChangedReducer,
	openCloseModelSelection: openCloseModelSelectionReducer,
	selectedModel: selectedModelReducer,
	sideMenuOpen: openSideMenuReducer,
});

// define the state of the App
export interface IAppState {
	engineStarted: IEngineStatusReducer;
	headerMaximizedClass: IHeaderMaximizedChangedReducer;
	openCloseModelSelection: IOpenCloseModelSelectionReducer;
	selectedModel: ISelectedModelReducer;
	sideMenuOpen: IMenuOpenReducer;
}

export default rootReducer;
