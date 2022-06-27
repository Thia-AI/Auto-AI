import { applyMiddleware, compose, createStore } from 'redux';
import thunk, { ThunkMiddleware } from 'redux-thunk';
import { createLogger } from 'redux-logger';
import { createHashHistory } from 'history';
import { createRouterMiddleware } from '@lagunovsky/redux-react-router';

import createRootReducer from './reducers';

/**
 * Hash history object keeps track of the browsing history of an application using the browser's built-in history stack.
 */
export const history = createHashHistory({
	// Set getUserConfirmation to empty function so that we can use a custom prompt instead of relying on the browser
	// getUserConfirmation: () => {},
});

/**
 * Contains the ReducerTypes for all reducers.
 */
export type AppState = ReturnType<typeof createRootReducer>;

const logger = createLogger({
	duration: true,
	timestamp: false,
	collapsed: true,
});

let middleWare = [thunk as ThunkMiddleware, createRouterMiddleware(history)];
if (process.env.NODE_ENV === 'development') {
	middleWare = [...middleWare, logger];
}

/**
 * Creates our Redux store instance used in **renderer**.
 *
 * @returns Redux store.
 */
export const configureStore = () =>
	createStore(
		createRootReducer(history),
		compose(applyMiddleware(...middleWare), window['devToolsExtension'] ? window['devToolsExtension']() : (f) => f),
	);
