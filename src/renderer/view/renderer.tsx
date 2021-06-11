/**
 * Entry point
 */
// Import the styles here to process them with webpack
import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { Provider } from 'react-redux';
import { ChakraProvider, extendTheme, ColorModeScript } from '@chakra-ui/react';

import '_fonts/fonts.css';
import '_public/style.css';

import { App } from './App';
import { store } from '../state/store';

const theme = extendTheme({
	styles: {
		global: {
			body: {
				backgroundColor: 'gray.800',
			},
		},
	},
	config: {
		initialColorMode: 'dark',
		useSystemColorMode: false,
	},
	colors: {
		gray: {
			850: '#171d29',
		},
		red: {
			450: '#f25757',
		},
	},
});

ReactDOM.render(
	<>
		<ColorModeScript initialColorMode={theme.config.initialColorMode} />
		<Provider store={store}>
			<ChakraProvider theme={theme}>
				<App />
			</ChakraProvider>
		</Provider>
	</>,
	document.getElementById('app'),
);
