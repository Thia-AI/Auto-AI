import React, { useEffect } from 'react';
import { Button, Center, Heading, useToast } from '@chakra-ui/react';
import { useAuth } from 'reactfire';
import { signInWithCustomToken, setPersistence } from 'firebase/auth';
import { ipcRenderer } from 'electron';
import { IPC_SEND_AUTH_CREDENTIAL_TO_MAIN_RENDERER, IPC_SHOW_LOGIN_WINDOW } from '_/shared/ipcChannels';
import { persistenceMap, PERSISTENCE_TYPE } from '_/shared/appConstants';

/**
 * Login page.
 *
 * @react
 */
const LandingPage = () => {
	const auth = useAuth();
	const toast = useToast();

	const showLoginWindow = async () => {
		await ipcRenderer.invoke(IPC_SHOW_LOGIN_WINDOW);
	};

	useEffect(() => {
		// Issue of being called multiple times when signing out and singing on multiple times resulting in
		// multiple toast notifications being sent
		ipcRenderer.once(
			IPC_SEND_AUTH_CREDENTIAL_TO_MAIN_RENDERER,
			(event, customToken: string, persistence: PERSISTENCE_TYPE) => {
				setPersistence(auth, persistenceMap[persistence])
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
			},
		);
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
