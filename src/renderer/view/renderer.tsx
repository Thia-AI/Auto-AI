/**
 * Entry point
 */
// Import the styles here to process them with webpack
import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { Provider } from 'react-redux';

import '_public/style.css';
import '_fonts/fonts.css';

import App from './App';
import { store } from '../state/store';

ReactDOM.render(
	<Provider store={store}>
		<App />
	</Provider>,
	document.getElementById('app'),
);
