import React, { useEffect } from 'react';
import { connect } from 'react-redux';
import { Switch, Route } from 'react-router-dom';
import { ConnectedRouter as Router } from 'connected-react-router';

import { openCloseSideMenu } from '_state/side-menu/SideModelAction';
import { IMenuOpenCloseAction } from '_state/side-menu/model/actionTypes';
import { history } from '_state/store';

import Header from './components/header/Header';
import { SideMenu } from './components/side-menu/SideMenu';
// Pages
import { Main } from './pages/Main';
import { Models } from './pages/Models';
import { Jobs } from './pages/Jobs';
import { Exports } from './pages/Exports';
import { Deployments } from './pages/Deployments';
import { Notifications } from './pages/Notifications';
import { Logs } from './pages/Logs';
import { Quota } from './pages/Quota';
import { Subscription } from './pages/Subscription';
import { Settings } from './pages/Settings';
import { Help } from './pages/Help';

/**
 * App component
 */

interface Props {
	openCloseSideMenu: () => IMenuOpenCloseAction;
}

const AppC = (props: Props) => {
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
	return (
		<>
			<Header />
			<Router history={history}>
				<Switch>
					<Route exact path='/' component={Main} />
					<Route exact path='/models' component={Models} />
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
			</Router>
			<SideMenu />
		</>
	);
};
const mapStateToProps = () => ({});
export const App = connect(mapStateToProps, {
	openCloseSideMenu,
})(AppC);
