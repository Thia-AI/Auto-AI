import React, { Component } from 'react';
import { ipcRenderer } from 'electron';

import './Main.css';

export default class Main extends Component {
	constructor(props) {
		super(props);
	}

	state = {
		output: '',
	};

	runPython = () => {
		ipcRenderer.send('test-python:run');
	};

	componentWillUnmount() {
		// ipcRenderer.removeAllListeners('test-python:run');
	}

	componentDidMount() {
		ipcRenderer.on('test-python:run', (event, result) => {
			this.setState({
				output: result[0],
			});
		});
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
