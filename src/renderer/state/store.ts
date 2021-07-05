import { applyMiddleware, compose, createStore } from 'redux';
import thunk, { ThunkMiddleware } from 'redux-thunk';
import { createLogger } from 'redux-logger';
import { createHashHistory } from 'history';
import { routerMiddleware } from 'connected-react-router';

import createRootReducer from './reducers';

export const history = createHashHistory();

// AppState will contain the ReducerTypes for all reducers
export type AppState = ReturnType<typeof createRootReducer>;

const logger = createLogger({
	duration: true,
	timestamp: false,
	collapsed: true,
});

let middleWare = [thunk as ThunkMiddleware, routerMiddleware(history)];
if (process.env.NODE_ENV === 'development') {
	middleWare = [...middleWare, logger];
}
// create our store

export const configureStore = () =>
	createStore(
		createRootReducer(history),
		compose(
			applyMiddleware(...middleWare),
			window['devToolsExtension'] ? window['devToolsExtension']() : (f) => f,
		),
	);
