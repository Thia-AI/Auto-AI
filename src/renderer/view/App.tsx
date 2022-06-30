import React, { Suspense, lazy } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { Center, Spinner } from '@chakra-ui/react';
import { ReduxRouter } from '@lagunovsky/redux-react-router';
import { history } from '_state/store';

import { Header } from './components/header/Header';
import { SideMenu } from './components/side-menu/SideMenu';
import { EngineNotificationsHandler } from './components/notifications/EngineNotificationsHandler';
import { DevDashboard } from './components/dev/DevDashboard';
import { AuthProvider, useFirebaseApp } from 'reactfire';
import { getAuth } from 'firebase/auth';
import { EngineAvailableRoute } from './customRoutes/EngineAvailableRoute';
import { UnauthenticatedRoute, AuthWrapper } from './customRoutes/AuthRoutes';

/**
 * Main portion of the **renderer**.
 */
export const App = React.memo(() => {
	const app = useFirebaseApp();
	const auth = getAuth(app);

	// Lazy loading routes
	const Main = lazy(() => import('./pages/Main'));
	const Models = lazy(() => import('./pages/Models'));
	const Model = lazy(() => import('./pages/Model'));
	const Jobs = lazy(() => import('./pages/Jobs'));
	const Exports = lazy(() => import('./pages/Exports'));
	const Deployments = lazy(() => import('./pages/Deployments'));
	const Notifications = lazy(() => import('./pages/Notifications'));
	const Logs = lazy(() => import('./pages/Logs'));
	const Quota = lazy(() => import('./pages/Quota'));
	const Subscription = lazy(() => import('./pages/Subscription'));
	const Settings = lazy(() => import('./pages/Settings'));
	const Help = lazy(() => import('./pages/Help'));
	const Dataset = lazy(() => import('./pages/Dataset'));

	return (
		<>
			<AuthProvider sdk={auth}>
				<SideMenu />
				<EngineNotificationsHandler />
				<DevDashboard />
				<ReduxRouter history={history}>
					<Header />
					<Suspense
						fallback={
							<Center w='full' h='full' marginTop='var(--header-height)'>
								<Spinner color='gray.600' size='lg' />
							</Center>
						}>
						<AuthWrapper unauthenticatedFallback={<UnauthenticatedRoute />}>
							<Routes>
								<Route path='/' element={<Main />} />
								<Route
									path='/models'
									element={
										<EngineAvailableRoute>
											<Models />
										</EngineAvailableRoute>
									}
								/>
								<Route
									path='/models/:id'
									element={
										<EngineAvailableRoute>
											<Model />
										</EngineAvailableRoute>
									}
								/>
								<Route
									path='/dataset/:id'
									element={
										<EngineAvailableRoute>
											<Dataset />
										</EngineAvailableRoute>
									}
								/>
								<Route
									path='/jobs'
									element={
										<EngineAvailableRoute>
											<Jobs />
										</EngineAvailableRoute>
									}
								/>
								<Route
									path='/exports'
									element={
										<EngineAvailableRoute>
											<Exports />
										</EngineAvailableRoute>
									}
								/>
								<Route
									path='/deployments'
									element={
										<EngineAvailableRoute>
											<Deployments />
										</EngineAvailableRoute>
									}
								/>
								<Route
									path='/notifications'
									element={
										<EngineAvailableRoute>
											<Notifications />
										</EngineAvailableRoute>
									}
								/>
								<Route
									path='/logs'
									element={
										<EngineAvailableRoute>
											<Logs />
										</EngineAvailableRoute>
									}
								/>
								<Route
									path='/quota'
									element={
										<EngineAvailableRoute>
											<Quota />
										</EngineAvailableRoute>
									}
								/>
								<Route
									path='/subscription'
									element={
										<EngineAvailableRoute>
											<Subscription />
										</EngineAvailableRoute>
									}
								/>
								<Route
									path='/help'
									element={
										<EngineAvailableRoute>
											<Help />
										</EngineAvailableRoute>
									}
								/>

								<Route path='/settings' element={<Settings />} />
								<Route path='*' element={<Navigate replace to='/' />} />
							</Routes>
						</AuthWrapper>
					</Suspense>
				</ReduxRouter>
			</AuthProvider>
		</>
	);
});

App.displayName = 'App';
