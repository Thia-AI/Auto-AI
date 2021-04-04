import React, { Component } from 'react';
import { ipcRenderer } from 'electron';

import './EngineModal.css';

interface ModalProps {
	loader: JSX.Element;
}

class EngineModal extends Component<ModalProps> {
	constructor(props) {
		super(props);
		this.checkForEngineStart();
	}

	state = {
		engineStarted: false,
	};

	checkForEngineStart = () => {
		ipcRenderer.on('engine:started', () => {
			this.setState({ engineStarted: true });
		});
	};

	render() {
		let { engineStarted } = this.state;
		if (engineStarted) {
			return null;
		}
		return <div className='modal'>{this.props.loader}</div>;
	}
}

export { EngineModal };
