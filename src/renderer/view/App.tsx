import React, { Suspense, lazy } from 'react';
import { Switch, Route, Redirect } from 'react-router-dom';
import { ConnectedRouter as Router } from 'connected-react-router';
import { Center, Spinner } from '@chakra-ui/react';

import { history } from '_state/store';

import { Header } from './components/header/Header';
import { SideMenu } from './components/side-menu/SideMenu';
import { NotificationsHandler } from './components/notifications/NotificationsHandler';
import { DevDashboard } from './components/dev/DevDashboard';
import { AuthProvider, useFirebaseApp, useSigninCheck } from 'reactfire';
import { getAuth } from 'firebase/auth';

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
					<NotificationsHandler />
					<DevDashboard />
					<Router history={history}>
						<Header />
						<Suspense
							fallback={
								<Center w='full' h='full' marginTop='var(--header-height)'>
									<Spinner color='gray.600' size='lg' />
								</Center>
							}>
							<AuthWrapper fallback={<AuthRoute />}>
								<Switch>
									<Route exact path='/' component={Main} />
									<Route exact path='/models' component={Models} />
									<Route exact path='/models/:id' component={Model} />
									<Route exact path='/dataset/:id' component={Dataset} />
									<Route exact path='/jobs' component={Jobs} />
									<Route exact path='/exports' component={Exports} />
									<Route exact path='/deployments' component={Deployments} />
									<Route exact path='/notifications' component={Notifications} />
									<Route exact path='/logs' component={Logs} />
									<Route exact path='/quota' component={Quota} />
									<Route exact path='/subscription' component={Subscription} />
									<Route exact path='/settings' component={Settings} />
									<Route exact path='/help' component={Help} />
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

// eslint-disable-next-line jsdoc/require-param
/**
 * AuthWrapper that renders children if signed into firebase.
 *
 * @react
 */
export const AuthWrapper = ({
	children,
	fallback,
}: React.PropsWithChildren<{ fallback: JSX.Element }>): JSX.Element => {
	const { status, data: signInCheckResult } = useSigninCheck();
	console.log(signInCheckResult);
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

	return fallback;
};

const AuthRoute = () => {
	const Login = lazy(() => import('./pages/LandingPage'));
	const Register = lazy(() => import('./pages/Register'));

	return (
		<Switch>
			<Route exact path='/login'>
				<Login />
			</Route>
			<Route exact path='/create-account'>
				<Register />
			</Route>
			<Route exact path='*'>
				<Redirect to='/login' />
			</Route>
		</Switch>
	);
};
