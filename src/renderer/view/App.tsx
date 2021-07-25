import React, { useEffect, Suspense, lazy } from 'react';
import { connect } from 'react-redux';
import { Switch, Route } from 'react-router-dom';
import { ConnectedRouter as Router } from 'connected-react-router';
import { Center, Spinner } from '@chakra-ui/react';

import { openCloseSideMenu } from '_state/side-menu/SideModelAction';
import { IMenuOpenCloseAction } from '_state/side-menu/model/actionTypes';
import { history } from '_state/store';

import { Header } from './components/header/Header';
import { SideMenu } from './components/side-menu/SideMenu';
import { NotificationsHandler } from './components/notifications/NotificationsHandler';

/**
 * App component
 */

interface Props {
	openCloseSideMenu: () => IMenuOpenCloseAction;
}

const AppC = React.memo((props: Props) => {
	useEffect(() => {
		const openSideMenu = (event: KeyboardEvent) => {
			if (event.key == 'Escape') {
				props.openCloseSideMenu();
			}
		};

		window.addEventListener('keydown', openSideMenu);

		return () => {
			window.removeEventListener('keydown', openSideMenu);
		};
	}, []);

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
			<Header />
			<SideMenu />
			<NotificationsHandler />
			<Router history={history}>
				<Suspense
					fallback={
						<Center w='full' h='full' marginTop='var(--header-height)'>
							<Spinner color='gray.600' size='lg' />
						</Center>
					}>
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
					</Switch>
				</Suspense>
			</Router>
		</>
	);
});
const mapStateToProps = () => ({});
export const App = connect(mapStateToProps, {
	openCloseSideMenu,
})(AppC);
