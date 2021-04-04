import React, { Component } from 'react';
import { Main } from './pages/main/Main';
import { Header } from './components/header/Header';
import { Loader } from './components/loader/Loader';
import { EngineModal } from './components/engine-modal/EngineModal';

import './App.css';

export default class App extends Component {
	render() {
		return (
			<React.Fragment>
				<Header />
				<Main />
				<EngineModal loader={<Loader />} />
			</React.Fragment>
		);
	}
}
