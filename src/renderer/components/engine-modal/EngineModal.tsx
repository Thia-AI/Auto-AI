import React, { Component } from 'react';
import { ipcRenderer } from 'electron';

import './EngineModal.css';
import { Modal } from '../modal/Modal';

interface ModalProps {
	loader: JSX.Element;
}

/**
 * Component for creating a Modal for when **Engine** is being staretd
 */
class EngineModal extends Component<ModalProps> {
	constructor(props) {
		super(props);
		this.checkForEngineStart();
	}

	state = {
		engineStarted: false,
	};

	/**
	 * Register IPC for checking for **Engine** being started at creation of component
	 */
	checkForEngineStart = () => {
		// only for dev environment when you reload the app with Ctrl+R
		// when engine has already started
		ipcRenderer.invoke('engine-dev:started').then((engineStarted: boolean) => {
			this.setState({ engineStarted });
		});

		ipcRenderer.on('engine:started', () => {
			this.setState({ engineStarted: true });
		});
	};

	render() {
		let { engineStarted } = this.state;
		if (engineStarted) {
			return null;
		}
		return <Modal opacity={0.3}>{this.props.loader}</Modal>;
	}
}

export { EngineModal };
