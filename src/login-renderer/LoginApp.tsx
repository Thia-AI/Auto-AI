import React, { lazy, Suspense, useEffect, useState } from 'react';
import { getAuth, getRedirectResult, GoogleAuthProvider } from 'firebase/auth';
import { getFunctions } from 'firebase/functions';
import { AuthProvider, FunctionsProvider, useAuth, useFirebaseApp } from 'reactfire';
import { Navigate, Route, Routes, useNavigate } from 'react-router-dom';
import { Center, Spinner, useToast } from '@chakra-ui/react';
import { io } from 'socket.io-client';
import { LOGIN_WINDOW_LOGIN_WORKFLOW_COMPLETE, PERSISTENCE_TYPE } from '_/shared/appConstants';
import axios from 'axios';
import { BackendRequestHandler } from '_/renderer/backend-requests/backendRequestHandler';

const webAppConfig = {
	port: '8443',
	hostPort: 'localhost:8443',
	hostUrl: 'https://localhost:8443',
};

export const LoginApp = React.memo(() => {
	const app = useFirebaseApp();
	const auth = getAuth(app);
	const functions = getFunctions(app);
	const navigate = useNavigate();
	const toast = useToast();

	const Login = lazy(() => import('./Login'));
	const Register = lazy(() => import('./Register'));

	const [googleSignInLoading, setGoogleSignInLoading] = useState(false);
	const [googleRegisteringLoading, setGoogleRegisteringLoading] = useState(false);
	const [emailSignInLoading, setEmailSignInLoading] = useState(false);
	const [emailRegisteringLoading, setEmailRegisteringLoading] = useState(false);

	useEffect(() => {
		const socket = io(webAppConfig.hostUrl);
		socket.on(LOGIN_WINDOW_LOGIN_WORKFLOW_COMPLETE, () => {
			// Loaded
			setGoogleSignInLoading(false);
			setEmailSignInLoading(false);
			setEmailRegisteringLoading(false);
			setGoogleRegisteringLoading(false);
		});
		return () => {
			socket.disconnect();
		};
	}, []);

	useEffect(() => {
		getOAuthResponse();
	}, []);

	const getOAuthResponse = async () => {
		const result = await getRedirectResult(auth);
		if (result) {
			const idToken = await result.user.getIdToken();
			const [setNewUserRolesError, setNewUserRolesResData] =
				await BackendRequestHandler.getInstance().setNewUserRoles(idToken, {
					uid: result.user.uid,
				});
			if (!setNewUserRolesError) {
				setGoogleSignInLoading(true);
				setGoogleRegisteringLoading(true);
				const credential = GoogleAuthProvider.credentialFromResult(result);
				// Send that result to backend to create custom token
				await postLoginToken(result.user.uid, 'local');
			} else {
				toast({
					title: 'Error',
					description: 'Failed setting up new user',
					status: 'error',
					duration: 1500,
					isClosable: false,
				});
			}
		}
	};

	const postLoginToken = async (uid: string, persistence: PERSISTENCE_TYPE) => {
		await axios.post('https://localhost:8443/api/loginToken', {
			uid,
			persistence,
		});
		navigate('/');
	};
	return (
		<AuthProvider sdk={auth}>
			<FunctionsProvider sdk={functions}>
				<Suspense
					fallback={
						<Center w='full' h='full' marginTop='var(--header-height)'>
							<Spinner color='gray.600' size='lg' />
						</Center>
					}>
					<Routes>
						<Route
							path='/'
							element={
								<Login
									googleSignInLoading={googleSignInLoading}
									emailSignInLoading={emailSignInLoading}
									setEmailSignInLoading={setEmailSignInLoading}
									postLoginToken={postLoginToken}
								/>
							}
						/>
						<Route
							path='/register'
							element={
								<Register
									googleRegisteringLoading={googleRegisteringLoading}
									emailRegisteringLoading={emailRegisteringLoading}
									setEmailRegisteringLoading={setEmailRegisteringLoading}
									postLoginToken={postLoginToken}
								/>
							}
						/>
						<Route path='*' element={<Navigate to='/' />} />
					</Routes>
				</Suspense>
			</FunctionsProvider>
		</AuthProvider>
	);
});
