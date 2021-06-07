import React, { Component } from 'react';
import { ipcRenderer } from 'electron';
import { Box } from '@chakra-ui/react';

import './Main.css';
import { NewModel } from '_/renderer/view/components/new-model/NewModel';
import { ModelSelection } from '_/renderer/view/components/model-selection/ModelSelection';

/**
 * Component for main portion of **renderer**
 */
export class Main extends Component {
	constructor(props) {
		super(props);
	}

	runPython = () => {
		ipcRenderer.invoke('engine-action:getDevices').then((devices) => {
			console.log(JSON.parse(devices));
		});
	};

	componentWillUnmount() {
		ipcRenderer.removeAllListeners('engine-action:getDevices');
	}

	render() {
		return (
			<Box className='headerless-app'>
				<NewModel />
				<ModelSelection />
			</Box>
		);
	}
}
