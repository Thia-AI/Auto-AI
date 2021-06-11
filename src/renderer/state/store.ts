import { applyMiddleware, compose, createStore } from 'redux';
import thunk, { ThunkMiddleware } from 'redux-thunk';
import { createLogger } from 'redux-logger';

import AppActions from './appActions';

import reducers from './reducers';

// AppState will contain the ReducerTypes for all reducers
export type AppState = ReturnType<typeof reducers>;

const logger = createLogger({
	duration: true,
	timestamp: false,
	collapsed: true,
});

let middleWare = [thunk as ThunkMiddleware<AppState, AppActions>];
if (process.env.NODE_ENV === 'development') {
	middleWare = [...middleWare, logger];
}
// create our store
export const store = createStore(
	reducers,
	compose(
		applyMiddleware(...middleWare),
		window['devToolsExtension'] ? window['devToolsExtension']() : (f) => f,
	),
);
