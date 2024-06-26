import React, { lazy, useEffect } from 'react';

import { Center, Spinner } from '@chakra-ui/react';
import { ipcRenderer } from 'electron';
import { Routes, Route, Navigate } from 'react-router';
import { useSigninCheck, useUser } from 'reactfire';
import { IPC_ENGINE_START, IPC_ENGINE_STOP } from '_/shared/ipcChannels';

// eslint-disable-next-line jsdoc/require-param
/**
 * AuthWrapper that renders children if signed into firebase.
 *
 * @react
 */
export const AuthWrapper = ({
	children,
	unauthenticatedFallback,
}: React.PropsWithChildren<{ unauthenticatedFallback: JSX.Element }>): JSX.Element => {
	const { status, data: signInCheckResult } = useSigninCheck();
	const { data: user } = useUser();

	const startStopEngineOnAuthChange = async () => {
		if (status !== 'loading') {
			if (signInCheckResult.signedIn && user) {
				// Logged in
				await ipcRenderer.invoke(IPC_ENGINE_START, user.uid);
			} else {
				// Logged out
				await ipcRenderer.invoke(IPC_ENGINE_STOP);
			}
		}
	};
	useEffect(() => {
		startStopEngineOnAuthChange();
	}, [status, signInCheckResult, user]);
	if (!children) {
		throw new Error('Children must be provided');
	}
	if (status === 'loading') {
		return (
			<Center w='full' h='full' marginTop='var(--header-height)'>
				<Spinner color='gray.600' size='lg' />
			</Center>
		);
	} else if (signInCheckResult.signedIn) {
		return children as JSX.Element;
	}

	return unauthenticatedFallback;
};

/**
 * Unauthenticated React-Router switch for unauthenticated users.
 *
 * @returns Unauthenticated Routes.
 */
export const UnauthenticatedRoute = () => {
	const Landing = lazy(() => import('.././pages/LandingPage'));

	return (
		<Routes>
			<Route path='/landing' element={<Landing />} />
			<Route path='*' element={<Navigate replace to='/landing' />} />
		</Routes>
	);
};
