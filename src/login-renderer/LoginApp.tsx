import React, { lazy, Suspense, useEffect, useState } from 'react';
import { getAuth, getRedirectResult, GoogleAuthProvider } from 'firebase/auth';
import { getFunctions } from 'firebase/functions';
import { AuthProvider, FunctionsProvider, useAuth, useFirebaseApp } from 'reactfire';
import { BrowserRouter, HashRouter, Redirect, Route, Switch, useHistory } from 'react-router-dom';
import { Center, Spinner } from '@chakra-ui/react';
import { io } from 'socket.io-client';
import { LOGIN_WINDOW_LOGIN_WORKFLOW_COMPLETE, PERSISTENCE_TYPE } from '_/shared/appConstants';
import axios from 'axios';

const webAppConfig = {
	port: '8443',
	hostPort: 'localhost:8443',
	hostUrl: 'https://localhost:8443',
};

export const LoginApp = React.memo(() => {
	const app = useFirebaseApp();
	const auth = getAuth(app);
	const functions = getFunctions(app);
	const history = useHistory();

	const Login = lazy(() => import('./Login'));
	const Register = lazy(() => import('./Register'));
	// TODO: Split up state for registering with email, google login, and sign in with email
	const [signInLoading, setSignInLoading] = useState(false);

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

	useEffect(() => {
		getOAuthResponse();
	}, []);

	const getOAuthResponse = async () => {
		const result = await getRedirectResult(auth);
		if (result) {
			setSignInLoading(true);
			const credential = GoogleAuthProvider.credentialFromResult(result);
			// Send that result to backend to create custom token
			await postLoginToken(result.user.uid, 'local');
		}
	};

	const postLoginToken = async (uid: string, persistence: PERSISTENCE_TYPE) => {
		await axios.post('https://localhost:8443/api/loginToken', {
			uid,
			persistence,
		});
		history.push('/');
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
					<Switch>
						<Route
							exact
							path='/'
							component={() => (
								<Login
									signInLoading={signInLoading}
									setSignInLoading={setSignInLoading}
									postLoginToken={postLoginToken}
								/>
							)}
						/>
						<Route
							exact
							path='/register'
							component={() => (
								<Register
									registerLoading={signInLoading}
									setRegisterLoading={setSignInLoading}
									postLoginToken={postLoginToken}
								/>
							)}
						/>
						<Route exact path='*'>
							<Redirect to='/' />
						</Route>
					</Switch>
				</Suspense>
			</FunctionsProvider>
		</AuthProvider>
	);
});
