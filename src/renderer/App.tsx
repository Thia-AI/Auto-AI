import React, { Component } from 'react';
import Main from './pages/main/Main';
import Header from './components/header/Header';

export default class App extends Component {
	render() {
		return (
			<React.Fragment>
				<Header />
				<Main />
			</React.Fragment>
		);
	}
}
