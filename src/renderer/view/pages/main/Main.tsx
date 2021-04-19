import React, { Component } from 'react';
import { ipcRenderer } from 'electron';
import './Main.css';
import NewModel from '_/renderer/view/components/new-model/NewModel';
import ModelSelection from '_/renderer/view/components/model-selection/ModelSelection';
import { connect } from 'react-redux';
import { IAppState } from '_/renderer/state/reducers';
import { openCloseModelSelectionReducer } from '_state/choose-model/ChooseModelReducers';

/**
 * Component for main portion of **renderer**
 */
class Main extends Component {
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
			<div className='headerless-app'>
				<NewModel />
				<ModelSelection />
			</div>
		);
	}
}

export default Main;
