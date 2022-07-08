/**
 * Entry point
 */
// Import the styles here to process them with webpack
import * as React from 'react';
import { createRoot } from 'react-dom/client';
import { Provider as ReduxProvider } from 'react-redux';
import { ChakraProvider, ColorModeScript } from '@chakra-ui/react';
import { FirebaseAppProvider } from 'reactfire';

import '_public/style.css';
// Fonts
import '@fontsource/poppins';
import '@fontsource/open-sans';
import '@fontsource/jetbrains-mono';

import { App } from './App';
import { configureStore } from '../state/store';
import { EngineRequestHandler } from '_/renderer/engine-requests/engineRequestHandler';
import EngineRequestConfig from '_/shared/engineRequestConfig';
import { getFirebaseConfig } from '../firebase/firebase';
import { theme } from '_/shared/theming/chakraTheme';
import { BackendRequestHandler } from '../backend-requests/backendRequestHandler';
import BackendRequestConfig from '_/shared/backendRequestConfig';
import { ToastContainer } from './helpers/functionHelpers';

/**
 * Redux store.
 */
export const store = configureStore();

const engineRequestHandler = EngineRequestHandler.getInstance();
const backendRequestHandler = BackendRequestHandler.getInstance();
engineRequestHandler.initInstances(EngineRequestConfig);
backendRequestHandler.initInstances(BackendRequestConfig);

const container = document.getElementById('app');
const root = createRoot(container!);
const firebaseConfig = getFirebaseConfig();

root.render(
	<>
		<ColorModeScript initialColorMode={theme.config.initialColorMode} />
		<ReduxProvider store={store}>
			<ChakraProvider theme={theme}>
				<FirebaseAppProvider firebaseConfig={firebaseConfig}>
					<App />
					<ToastContainer />
				</FirebaseAppProvider>
			</ChakraProvider>
		</ReduxProvider>
	</>,
);
