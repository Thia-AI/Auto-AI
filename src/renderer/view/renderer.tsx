/**
 * Entry point
 */
// Import the styles here to process them with webpack
import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { Provider as ReduxProvider } from 'react-redux';
import { ChakraProvider, extendTheme, ColorModeScript } from '@chakra-ui/react';
import { FirebaseAppProvider } from 'reactfire';

import '_public/style.css';

import { App } from './App';
import { configureStore } from '../state/store';
import { EngineActionHandler } from '_engine_requests/engineActionHandler';
import EngineRequestConfig from '_/shared/engineRequestConfig';
import { firebaseConfig } from '../firebase/firebase';
import { theme } from '_/shared/chakraTheme';

/**
 * Redux store.
 */
export const store = configureStore();

const engineActionHandler = EngineActionHandler.getInstance();
engineActionHandler.initInstances(EngineRequestConfig);

ReactDOM.render(
	<>
		<ColorModeScript initialColorMode={theme.config.initialColorMode} />
		<ReduxProvider store={store}>
			<ChakraProvider theme={theme}>
				<FirebaseAppProvider firebaseConfig={firebaseConfig}>
					<App />
				</FirebaseAppProvider>
			</ChakraProvider>
		</ReduxProvider>
	</>,
	document.getElementById('app'),
);
