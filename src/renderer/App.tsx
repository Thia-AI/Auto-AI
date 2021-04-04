import React, { Component } from 'react';
import { Main } from './pages/main/Main';
import { Header } from './components/header/Header';
import { Loader } from './components/loader/Loader';
import { Modal } from './components/modal/Modal';

import './App.css';

export default class App extends Component {
	render() {
		return (
			<React.Fragment>
				<Header />
				<Main />
				<Modal loader={<Loader />} />
			</React.Fragment>
		);
	}
}
