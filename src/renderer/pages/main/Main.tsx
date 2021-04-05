import React, { Component } from 'react';
import { ipcRenderer } from 'electron';
import { Loader } from '../../components/loader/Loader';
import './Main.css';

class Main extends Component {
	constructor(props) {
		super(props);
	}

	state = {
		output: '',
	};

	runPython = () => {
		console.log('SANT');
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
