import React, { useEffect } from 'react';
import { AuthProvider, useAuth, useFirebaseApp } from 'reactfire';
import { auth as UIAuth } from 'firebaseui';
import { getRedirectResult, GoogleAuthProvider, signInWithRedirect } from 'firebase/auth';
import { Box, Button, Center } from '@chakra-ui/react';
import { FaGoogle } from 'react-icons/fa';
import axios from 'axios';

export const Login = React.memo(() => {
	const auth = useAuth();
	const provider = new GoogleAuthProvider();
	provider.setCustomParameters({
		prompt: 'select_account consent',
	});
	const googleLogin = async () => {
		await signInWithRedirect(auth, provider);
	};
	useEffect(() => {
		getOAuthResponse();
	}, []);

	const getOAuthResponse = async () => {
		const result = await getRedirectResult(auth);
		if (result) {
			const credential = GoogleAuthProvider.credentialFromResult(result);
			// Send that result to backend to create custom token
			await axios.post('https://localhost:8443/api/loginToken', {
				uid: result.user.uid,
			});
		}
	};
	return (
		<Center w='full' h='full'>
			<Button bgColor='#4285F4' onClick={googleLogin}>
				Sign in with Google
			</Button>
		</Center>
	);
});
