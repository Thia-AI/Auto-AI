import React, { useEffect } from 'react';
import { getAuth } from 'firebase/auth';
import { getFunctions } from 'firebase/functions';
import { AuthProvider, FunctionsProvider, useAuth, useFirebaseApp } from 'reactfire';
import { Login } from './Login';

export const LoginApp = React.memo(() => {
	const app = useFirebaseApp();
	const auth = getAuth(app);
	const functions = getFunctions(app);

	return (
		<AuthProvider sdk={auth}>
			<FunctionsProvider sdk={functions}>
				<Login />
			</FunctionsProvider>
		</AuthProvider>
	);
});
