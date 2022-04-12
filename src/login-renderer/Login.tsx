import React, { useEffect, useState } from 'react';
import { AuthProvider, useAuth, useFirebaseApp } from 'reactfire';
import { auth as UIAuth } from 'firebaseui';
import { getRedirectResult, GoogleAuthProvider, signInWithRedirect } from 'firebase/auth';
import { Box, Button, Center } from '@chakra-ui/react';
import { FaGoogle } from 'react-icons/fa';
import { io } from 'socket.io-client';
import axios from 'axios';
import { IPC_LOGIN_WINDOW_LOGIN_WORKFLOW_COMPLETE } from '_/shared/ipcChannels';

const webAppConfig = {
	port: '8443',
	hostPort: 'localhost:8443',
	hostUrl: 'https://localhost:8443',
};

export const Login = React.memo(() => {
	const auth = useAuth();
	const provider = new GoogleAuthProvider();
	const [signInLoading, setSignInLoading] = useState(false);
	provider.setCustomParameters({
		prompt: 'select_account consent',
	});
	const googleLogin = async () => {
		await signInWithRedirect(auth, provider);
	};
	useEffect(() => {
		getOAuthResponse();
	}, []);

	useEffect(() => {
		const socket = io(webAppConfig.hostUrl);
		socket.on(IPC_LOGIN_WINDOW_LOGIN_WORKFLOW_COMPLETE, () => {
			// Loaded
			setSignInLoading(false);
		});
		return () => {
			socket.disconnect();
		};
	}, []);

	const getOAuthResponse = async () => {
		const result = await getRedirectResult(auth);
		if (result) {
			setSignInLoading(true);
			const credential = GoogleAuthProvider.credentialFromResult(result);
			// Send that result to backend to create custom token
			await axios.post('https://localhost:8443/api/loginToken', {
				uid: result.user.uid,
			});
		}
	};
	return (
		<Center w='full' h='full'>
			<Button bgColor='#4285F4' onClick={googleLogin} isLoading={signInLoading}>
				Sign in with Google
			</Button>
		</Center>
	);
});
