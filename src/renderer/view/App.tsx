import React, { Component } from 'react';
import { Spinner } from '@chakra-ui/react';

import { Main } from './pages/main/Main';
import Header from './components/header/Header';
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
				<EngineModal loader={<Spinner size='xl' color='red.500' thickness='2px' />} />
				<Main />
			</React.Fragment>
		);
	}
}
