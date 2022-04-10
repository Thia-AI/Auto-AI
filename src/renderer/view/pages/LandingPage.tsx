import React, { useEffect } from 'react';
import { Box, Button, Center, Heading, useToast } from '@chakra-ui/react';
import { auth as UIAuth } from 'firebaseui';
import { useFirebaseApp, useAuth } from 'reactfire';
import {
	GoogleAuthProvider,
	getAuth,
	signInWithPopup,
	getRedirectResult,
	OAuthCredential,
	signInWithCredential,
	indexedDBLocalPersistence,
	browserLocalPersistence,
	signInWithCustomToken,
	setPersistence,
} from 'firebase/auth';
import { ipcRenderer } from 'electron';
import { IPC_SEND_AUTH_CREDENTIAL_TO_MAIN_RENDERER, IPC_SHOW_LOGIN_WINDOW } from '_/shared/ipcChannels';

/**
 * Login page.
 *
 * @react
 */
const LandingPage = () => {
	const app = useFirebaseApp();
	const auth = useAuth();
	const toast = useToast();

	const showLoginWindow = async () => {
		await ipcRenderer.invoke(IPC_SHOW_LOGIN_WINDOW);
	};

	useEffect(() => {
		ipcRenderer.on(IPC_SEND_AUTH_CREDENTIAL_TO_MAIN_RENDERER, (event, customToken) => {
			setPersistence(auth, browserLocalPersistence)
				.then(() => {
					signInWithCustomToken(auth, customToken)
						.then((userCredential) => {
							console.log('SIGNED IN');
							toast({
								title: 'Login Successful',
								description: `Welcome ${userCredential.user.displayName}`,
								status: 'success',
								duration: 1500,
								isClosable: false,
							});
						})
						.catch((error) => {
							console.log(error);
							// TODO: Handle error
						});
				})
				.catch((error) => {
					console.log(error);
				});
		});
	}, []);
	return (
		<Center w='full' h='full' marginTop='var(--header-height)' flexDir='column'>
			<Heading>Landing Page</Heading>
			<Button mt='3' onClick={showLoginWindow}>
				Get Started
			</Button>
		</Center>
	);
};

export default LandingPage;
