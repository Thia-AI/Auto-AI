import React, { Component } from 'react';
import { Main } from './pages/main/Main';
import { Header } from './components/header/Header';
import { Loader } from './components/loader/Loader';
import EngineModal from './components/engine-modal/EngineModal';

import './App.css';
/**
 * App component
 */
export default class App extends Component {
	render() {
		return (
			<React.Fragment>
				<Header />
				{/* Modal with loader */}
				<EngineModal loader={<Loader />} />
				<Main />
			</React.Fragment>
		);
	}
}
