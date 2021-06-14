import React, { useEffect } from 'react';
import { connect } from 'react-redux';

import { openCloseSideMenu } from '_state/side-menu/SideModelAction';
import { IMenuOpenCloseAction } from '_state/side-menu/model/actionTypes';

import { Main } from './pages/main/Main';
import Header from './components/header/Header';
import { SideMenu } from './components/side-menu/SideMenu';

import './App.css';

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
		<React.Fragment>
			<Header />
			<Main />
			<SideMenu />
		</React.Fragment>
	);
};
const mapStateToProps = () => ({});
export const App = connect(mapStateToProps, {
	openCloseSideMenu,
})(AppC);
