import React, { Component } from 'react';
import { ipcRenderer } from 'electron';
import { CSSTransition } from 'react-transition-group';
import { connect } from 'react-redux';
import { ThunkAction } from 'redux-thunk';

import { IAppState } from '_state/reducers';
import {
	listenForEngineStart,
	getDevReloadEngineStatus,
} from '_state/engine-status/EngineStatusActions';

import { Modal } from '../modal/Modal';

import './EngineModal.css';
import { IEngineStatusReducer } from '_/renderer/state/engine-status/model/reducerTypes';
import {
	IEngineDevStatusAction,
	IEngineStartedAction,
} from '_/renderer/state/engine-status/model/actionTypes';

interface ModalProps {
	loader: JSX.Element;
	// action creators
	listenForEngineStart: () => IEngineStartedAction;
	getDevReloadEngineStatus: () => ThunkAction<
		void,
		{},
		undefined,
		IEngineDevStatusAction
	>;
	// reducers
	engineStarted: IEngineStatusReducer;
}

/**
 * Component for creating a Modal for when **Engine** is being staretd
 */
class EngineModal extends Component<ModalProps> {
	constructor(props) {
		super(props);
		this.checkForEngineStart();
	}

	/**
	 * Register IPC for checking for **Engine** being started at creation of component
	 */
	checkForEngineStart = () => {
		// only for dev environment when you reload the app with Ctrl+R
		// when engine has already started
		this.props.getDevReloadEngineStatus();

		ipcRenderer.on('engine:started', () => {
			this.props.listenForEngineStart();
		});
	};

	render() {
		return (
			<CSSTransition
				in={!this.props.engineStarted.value}
				timeout={300}
				classNames='engine-modal-transition'
				unmountOnExit>
				<Modal opacity={0.3}>{this.props.loader}</Modal>
			</CSSTransition>
		);
	}
}

const mapStateToProps = (state: IAppState) => {
	return {
		engineStarted: state.engineStarted,
	};
};

export default connect(mapStateToProps, {
	listenForEngineStart,
	getDevReloadEngineStatus,
})(EngineModal);
