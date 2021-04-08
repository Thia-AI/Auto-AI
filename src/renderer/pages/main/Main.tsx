import React, { Component } from 'react';
import { ipcRenderer } from 'electron';
import './Main.css';
import { NewModel } from '_/renderer/components/new-model/NewModel';
import { ModelSelection } from '_/renderer/components/model-selection/ModelSelection';

/**
 * Component for main portion of **renderer**
 */
class Main extends Component {
	constructor(props) {
		super(props);
	}

	state = {
		output: '',
	};

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
			<div className='headerless-app'>
				<NewModel />
				{/* <ModelSelection /> */}
			</div>
		);
	}
}

export { Main };
