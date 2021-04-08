import React, { Component } from 'react';
import { ipcRenderer } from 'electron';
import { CSSTransition } from 'react-transition-group';

import { Modal } from '../modal/Modal';

import './EngineModal.css';

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
		return (
			<CSSTransition
				in={!this.state.engineStarted}
				timeout={300}
				classNames='engine-modal-transition'
				unmountOnExit>
				<Modal opacity={0.3}>{this.props.loader}</Modal>
			</CSSTransition>
		);
	}
}

export { EngineModal };
