import React, { Component, MouseEvent } from 'react';
import { ipcRenderer } from 'electron';
import './Header.css';
import { connect } from 'react-redux';
import { IAppState } from '_/renderer/state/reducers';
import { changeHeaderMaximized } from '_state/header/HeaderActions';
import { IHeaderMaximizedChangedReducer } from '_/renderer/state/header/model/reducerTypes';
import { IHeaderMaximizeChangedAction } from '_/renderer/state/header/model/actionTypes';

interface Props {
	maximizedClass: IHeaderMaximizedChangedReducer;
	changeHeaderMaximized: (maximizedClass: string) => IHeaderMaximizeChangedAction;
}

/**
 * Since we use a frameless **Electron** app, we have to implement a custom window top bar
 */
class Header extends Component<Props> {
	constructor(props) {
		super(props);
		this.initToggleMaxRestoreButtons();
	}

	/**
	 * Closes the **renderer**'s BrowserWindow
	 * @param event click event
	 */
	closeWindow = async (event: MouseEvent) => {
		event.preventDefault();
		await ipcRenderer.invoke('window:close');
	};
	/**
	 * Unmaximizes the **renderer**'s BrowserWindow
	 * @param event click event
	 */
	unmaximizeWindow = async (event: MouseEvent) => {
		event.preventDefault();
		await ipcRenderer.invoke('window:unmaximize');
	};
	/**
	 * Maximizes the **renderer**'s BrowserWindow
	 * @param event click event
	 */
	maximizeWindow = async (event: MouseEvent) => {
		event.preventDefault();
		await ipcRenderer.invoke('window:maximize');
	};
	/**
	 * Minimizes the **renderer**'s BrowserWindow
	 * @param event click event
	 */
	minimizeWindow = async (event: MouseEvent) => {
		event.preventDefault();
		await ipcRenderer.invoke('window:minimize');
	};

	/**
	 * Initializes IPC for switching maximize and unmazimize buttons
	 */
	initToggleMaxRestoreButtons() {
		ipcRenderer.on('window:unmaximized', () => {
			this.props.changeHeaderMaximized('');
		});

		ipcRenderer.on('window:maximized', () => {
			this.props.changeHeaderMaximized('maximized');
		});
	}

	render() {
		return (
			<header id='titlebar' className={this.props.maximizedClass.value}>
				<div id='drag-region'>
					<div id='window-title'>
						<span>Thia Auto-ML</span>
					</div>
					<div id='window-controls'>
						<div
							className='title-button'
							id='min-button'
							onClick={this.minimizeWindow}>
							<svg width='11' height='1' viewBox='0 0 11 1'>
								<path d='m11 0v1h-11v-1z' strokeWidth='.26208' />
							</svg>
						</div>
						<div
							className='title-button'
							id='max-button'
							onClick={this.maximizeWindow}>
							<svg width='10' height='10' viewBox='0 0 10 10'>
								<path
									d='m10-1.6667e-6v10h-10v-10zm-1.001 1.001h-7.998v7.998h7.998z'
									strokeWidth='.25'
								/>
							</svg>
						</div>
						<div
							className='title-button'
							id='restore-button'
							onClick={this.unmaximizeWindow}>
							<svg width='11' height='11' viewBox='0 0 11 11'>
								<path
									d='m11 8.7978h-2.2021v2.2022h-8.7979v-8.7978h2.2021v-2.2022h8.7979zm-3.2979-5.5h-6.6012v6.6011h6.6012zm2.1968-2.1968h-6.6012v1.1011h5.5v5.5h1.1011z'
									strokeWidth='.275'
								/>
							</svg>
						</div>
						<div
							className='title-button'
							id='close-button'
							onClick={this.closeWindow}>
							<svg width='12' height='12' viewBox='0 0 12 12'>
								<path
									d='m6.8496 6 5.1504 5.1504-0.84961 0.84961-5.1504-5.1504-5.1504 5.1504-0.84961-0.84961 5.1504-5.1504-5.1504-5.1504 0.84961-0.84961 5.1504 5.1504 5.1504-5.1504 0.84961 0.84961z'
									strokeWidth='.3'
								/>
							</svg>
						</div>
					</div>
				</div>
			</header>
		);
	}
}

const mapStateToProps = (state: IAppState) => {
	return {
		maximizedClass: state.headerMaximizedClass,
	};
};

export default connect(mapStateToProps, {
	changeHeaderMaximized,
})(Header);
