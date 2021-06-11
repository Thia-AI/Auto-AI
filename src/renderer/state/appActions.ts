import { ChooseModelActions } from './choose-model/model/actionTypes';
import { EngineStatusActionTypes } from './engine-status/model/actionTypes';
import { HeaderActionTypes } from './header/model/actionTypes';
import { SideModelActionTypes } from './side-menu/model/actionTypes';

// Type union representing all action types from all features
type AppActions =
	| EngineStatusActionTypes
	| HeaderActionTypes
	| ChooseModelActions
	| SideModelActionTypes;

export default AppActions;
