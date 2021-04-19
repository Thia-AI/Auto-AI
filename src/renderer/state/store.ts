import { applyMiddleware, compose, createStore } from 'redux';
import thunk, { ThunkMiddleware } from 'redux-thunk';

import AppActions from './appActions';

import reducers from './reducers';

export type AppState = ReturnType<typeof reducers>;

export const store = createStore(
	reducers,
	compose(
		applyMiddleware(thunk as ThunkMiddleware<AppState, AppActions>),
		window['devToolsExtension'] ? window['devToolsExtension']() : (f) => f,
	),
);
