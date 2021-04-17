import { applyMiddleware, createStore } from 'redux';
import thunk, { ThunkMiddleware } from 'redux-thunk';

import AppActions from './appActions';

import reducers from './reducers';

export type AppState = ReturnType<typeof reducers>;

export const store = createStore(
	reducers,
	applyMiddleware(thunk as ThunkMiddleware<AppState, AppActions>),
);
