import { ChakraProvider, ColorModeScript } from '@chakra-ui/react';
import React from 'react';
import ReactDOM from 'react-dom';
import { FirebaseAppProvider } from 'reactfire';
import { firebaseConfig } from '_/renderer/firebase/firebase';
import { theme } from '_/shared/chakraTheme';
import { LoginApp } from './LoginApp';

import '_public/login-style.css';

ReactDOM.render(
	<>
		<ColorModeScript initialColorMode={theme.config.initialColorMode} />
		<ChakraProvider theme={theme}>
			<FirebaseAppProvider firebaseConfig={firebaseConfig}>
				<LoginApp />
			</FirebaseAppProvider>
		</ChakraProvider>
	</>,
	document.getElementById('app'),
);