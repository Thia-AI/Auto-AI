import React, { Suspense, lazy } from 'react';
import { Switch, Route, Redirect } from 'react-router-dom';
import { ConnectedRouter as Router } from 'connected-react-router';
import { Center, Spinner } from '@chakra-ui/react';

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
				<React.StrictMode>
					<SideMenu />
					<EngineNotificationsHandler />
					<DevDashboard />
					<Router history={history}>
						<Header />
						<Suspense
							fallback={
								<Center w='full' h='full' marginTop='var(--header-height)'>
									<Spinner color='gray.600' size='lg' />
								</Center>
							}>
							<AuthWrapper unauthenticatedFallback={<UnauthenticatedRoute />}>
								<Switch>
									<Route exact path='/' component={Main} />

									<EngineAvailableRoute exact path='/models' component={Models} />
									<EngineAvailableRoute exact path='/models/:id' component={Model} />
									<EngineAvailableRoute exact path='/dataset/:id' component={Dataset} />
									<EngineAvailableRoute exact path='/jobs' component={Jobs} />
									<EngineAvailableRoute exact path='/exports' component={Exports} />
									<EngineAvailableRoute exact path='/deployments' component={Deployments} />
									<EngineAvailableRoute exact path='/notifications' component={Notifications} />
									<EngineAvailableRoute exact path='/logs' component={Logs} />
									<EngineAvailableRoute exact path='/quota' component={Quota} />
									<EngineAvailableRoute exact path='/subscription' component={Subscription} />
									<EngineAvailableRoute exact path='/help' component={Help} />

									<Route exact path='/settings' component={Settings} />
									<Route exact path='*'>
										<Redirect to='/' />
									</Route>
								</Switch>
							</AuthWrapper>
						</Suspense>
					</Router>
				</React.StrictMode>
			</AuthProvider>
		</>
	);
});

App.displayName = 'App';
