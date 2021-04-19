import { ChooseModelActions } from './choose-model/model/actionTypes';
import { EngineStatusActionTypes } from './engine-status/model/actionTypes';
import { HeaderActionTypes } from './header/model/actionTypes';

type AppActions = EngineStatusActionTypes | HeaderActionTypes | ChooseModelActions;

export default AppActions;
