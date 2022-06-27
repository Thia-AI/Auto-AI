import { combineReducers } from 'redux';
import { createRouterReducer, ReduxRouterState } from '@lagunovsky/redux-react-router';

import { selectedModelReducer, openCloseModelSelectionReducer } from './choose-model/ChooseModelReducers';
import { ISelectedModelReducer, IOpenCloseModelSelectionReducer } from './choose-model/model/reducerTypes';

import { engineStatusReducer } from './engine-status/EngineStatusReducers';
import { openCloseDeleteDatasetReducer, openCloseDeleteLabelReducer } from './delete-modals/DeleteModalsReducers';
import { IOpenCloseDeleteDatasetReducer, IOpenCloseDeleteLabelReducer } from './delete-modals/model/reducerTypes';
import { IEngineStatusReducer } from './engine-status/model/reducerTypes';
import { headerMaximizedChangedReducer } from './header/HeaderReducers';
import { IHeaderMaximizedChangedReducer } from './header/model/reducerTypes';
import { IMenuOpenReducer, ISelectedPageReducer } from './side-menu/model/reducerTypes';
import { changeSelectedPageReducer, openSideMenuReducer } from './side-menu/SideModelReducers';
import { selectedDatasetReducer } from './choose-dataset-train/ChooseDatasetReducers';
import { ISelectedDatasetReducer } from './choose-dataset-train/model/reducerTypes';
import {
	datasetListLoadingReducer,
	datasetListReducer,
	datasetPreviewFilesReducer,
} from './dataset-list/DatasetListReducers';
import {
	IDatasetListLoadingReducer,
	IDatasetListReducer,
	IDatasetPreviewFilesReducer,
} from './dataset-list/model/reducerTypes';
import { notificationsReducer } from './notifications/NotificationReducers';
import { INotificationsReducer } from './notifications/model/reducerTypes';
import { activeDatasetReducer } from './active-dataset-page/ActiveDatasetReducers';
import { IActiveDatasetReducer } from './active-dataset-page/model/reducerTypes';
import {
	activeDatasetInputsPreviewIDReducer,
	activeDatasetInputsReducer,
	nextPageCursorReducer,
	previousPageCursorReducer,
} from './active-dataset-inputs/ActiveDatasetInputsReducers';
import {
	IActiveDatasetInputsPreviewIDReducer,
	IActiveDatasetInputsReducer,
	INextPageCursorReducer,
	IPreviousPageCursorReducer,
} from './active-dataset-inputs/model/reducerTypes';

// define the root reducer
/**
 * Definition of the root reducer.
 *
 * @param history The history object.
 * @returns The reducer function returned from {@link combineReducers `combineReducers()`}.
 */
const createRootReducer = (history) =>
	combineReducers({
		router: createRouterReducer(history),
		engineStarted: engineStatusReducer,
		headerMaximizedClass: headerMaximizedChangedReducer,
		openCloseModelSelection: openCloseModelSelectionReducer,
		selectedModel: selectedModelReducer,
		sideMenuOpen: openSideMenuReducer,
		selectedPage: changeSelectedPageReducer,
		selectedDataset: selectedDatasetReducer,
		openCloseDeleteDataset: openCloseDeleteDatasetReducer,
		openCloseDeleteLabel: openCloseDeleteLabelReducer,
		datasetList: datasetListReducer,
		datasetListLoading: datasetListLoadingReducer,
		datasetPreviewFiles: datasetPreviewFilesReducer,
		notifications: notificationsReducer,
		activeDataset: activeDatasetReducer,
		activeDatasetInputs: activeDatasetInputsReducer,
		activeDatasetInputsPreviewID: activeDatasetInputsPreviewIDReducer,
		nextPageCursor: nextPageCursorReducer,
		previousPageCursor: previousPageCursorReducer,
	});

/**
 * All state types for **renderer**.
 */
export interface IAppState {
	router: ReduxRouterState;
	engineStarted: IEngineStatusReducer;
	headerMaximizedClass: IHeaderMaximizedChangedReducer;
	openCloseModelSelection: IOpenCloseModelSelectionReducer;
	selectedModel: ISelectedModelReducer;
	sideMenuOpen: IMenuOpenReducer;
	selectedPage: ISelectedPageReducer;
	selectedDataset: ISelectedDatasetReducer;
	openCloseDeleteDataset: IOpenCloseDeleteDatasetReducer;
	openCloseDeleteLabel: IOpenCloseDeleteLabelReducer;
	datasetList: IDatasetListReducer;
	datasetListLoading: IDatasetListLoadingReducer;
	datasetPreviewFiles: IDatasetPreviewFilesReducer;
	notifications: INotificationsReducer;
	activeDataset: IActiveDatasetReducer;
	activeDatasetInputs: IActiveDatasetInputsReducer;
	activeDatasetInputsPreviewID: IActiveDatasetInputsPreviewIDReducer;
	nextPageCursor: INextPageCursorReducer;
	previousPageCursor: IPreviousPageCursorReducer;
}

export default createRootReducer;
