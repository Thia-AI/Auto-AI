import { ChakraProvider, ColorModeScript } from '@chakra-ui/react';
import React from 'react';
import { createRoot } from 'react-dom/client';
import { FirebaseAppProvider } from 'reactfire';
import { getFirebaseConfig } from '_/renderer/firebase/firebase';
import { HashRouter } from 'react-router-dom';
import { theme } from '_/shared/theming/chakraTheme';
import { LoginApp } from './LoginApp';

import '_public/login-style.css';
// Fonts
import '@fontsource/poppins';
import '@fontsource/open-sans';
import '@fontsource/jetbrains-mono';

import { BackendRequestHandler } from '_/renderer/backend-requests/backendRequestHandler';
import BackendRequestConfig from '_/shared/backendRequestConfig';

const backendRequestHandler = BackendRequestHandler.getInstance();
backendRequestHandler.initInstances(BackendRequestConfig);

const container = document.getElementById('app');
const root = createRoot(container!);
const firebaseConfig = getFirebaseConfig();

root.render(
	<>
		<ColorModeScript initialColorMode={theme.config.initialColorMode} />
		<ChakraProvider theme={theme}>
			<FirebaseAppProvider firebaseConfig={firebaseConfig}>
				<HashRouter>
					<LoginApp />
				</HashRouter>
			</FirebaseAppProvider>
		</ChakraProvider>
	</>,
);
