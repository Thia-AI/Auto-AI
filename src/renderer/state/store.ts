import { applyMiddleware, compose, createStore } from 'redux';
import thunk, { ThunkMiddleware } from 'redux-thunk';

import AppActions from './appActions';

import reducers from './reducers';

// AppState will contain the ReducerTypes for all reducers
export type AppState = ReturnType<typeof reducers>;

// create our store
export const store = createStore(
	reducers,
	compose(
		applyMiddleware(thunk as ThunkMiddleware<AppState, AppActions>),
		window['devToolsExtension'] ? window['devToolsExtension']() : (f) => f,
	),
);
