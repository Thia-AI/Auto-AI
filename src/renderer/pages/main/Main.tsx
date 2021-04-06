import React, { Component } from 'react';
import { ipcRenderer } from 'electron';
import './Main.css';

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
			<div className='app'>
				<button onClick={this.runPython}>Run Python</button>
				<p>Output: {this.state.output}</p>
			</div>
		);
	}
}

export { Main };
