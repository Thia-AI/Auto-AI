import React, { useEffect, useState } from 'react';
import { AuthProvider, useAuth, useFirebaseApp } from 'reactfire';
import { auth as UIAuth } from 'firebaseui';
import { getRedirectResult, GoogleAuthProvider, signInWithRedirect } from 'firebase/auth';
import { Box, Button, Center, chakra, Icon } from '@chakra-ui/react';
import { FaGoogle } from 'react-icons/fa';
import { io } from 'socket.io-client';
import axios from 'axios';
import { LOGIN_WINDOW_LOGIN_WORKFLOW_COMPLETE } from '_/shared/ipcChannels';
import GoogleDarkButton from '_utils/svgs/google-button-svgs/btn_google_dark_normal_ios.svg';

const webAppConfig = {
	port: '8443',
	hostPort: 'localhost:8443',
	hostUrl: 'https://localhost:8443',
};

const ChakraGoogleDarkButton = chakra(GoogleDarkButton);

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
		socket.on(LOGIN_WINDOW_LOGIN_WORKFLOW_COMPLETE, () => {
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
			<Button
				bg='#4285F4'
				borderRadius='sm'
				onClick={googleLogin}
				isLoading={signInLoading}
				_hover={{
					backgroundColor: '#4274f4',
				}}
				_active={{
					backgroundColor: '#426cf4',
				}}
				leftIcon={<ChakraGoogleDarkButton transform={'translateX(-3px)'} />}
				px='0'
				pr='2'>
				Sign in with Google
			</Button>
		</Center>
	);
});
