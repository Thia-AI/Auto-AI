import { combineReducers } from 'redux';
import { connectRouter } from 'connected-react-router';

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
import { IMenuOpenReducer, ISelectedPageReducer } from './side-menu/model/reducerTypes';
import { changeSelectedPageReducer, openSideMenuReducer } from './side-menu/SideModelReducers';
import { selectedDatasetReducer } from './choose-dataset-train/ChooseDatasetReducers';
import { ISelectedDatasetReducer } from './choose-dataset-train/model/reducerTypes';

// define the root reducer
const createRootReducer = (history) =>
	combineReducers({
		router: connectRouter(history),
		engineStarted: engineStatusReducer,
		headerMaximizedClass: headerMaximizedChangedReducer,
		openCloseModelSelection: openCloseModelSelectionReducer,
		selectedModel: selectedModelReducer,
		sideMenuOpen: openSideMenuReducer,
		selectedPage: changeSelectedPageReducer,
		selectedDataset: selectedDatasetReducer,
	});

// define the state of the App
export interface IAppState {
	engineStarted: IEngineStatusReducer;
	headerMaximizedClass: IHeaderMaximizedChangedReducer;
	openCloseModelSelection: IOpenCloseModelSelectionReducer;
	selectedModel: ISelectedModelReducer;
	sideMenuOpen: IMenuOpenReducer;
	selectedPage: ISelectedPageReducer;
	selectedDataset: ISelectedDatasetReducer;
}

export default createRootReducer;
