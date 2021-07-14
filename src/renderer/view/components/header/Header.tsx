import React, { PureComponent, MouseEvent } from 'react';
import { ipcRenderer, remote } from 'electron';
import { connect } from 'react-redux';
import { Box, Center, Flex, Spacer, Spinner } from '@chakra-ui/react';

import './Header.css';
import { IAppState } from '_/renderer/state/reducers';
import { changeHeaderMaximized } from '_state/header/HeaderActions';
import { IHeaderMaximizedChangedReducer } from '_/renderer/state/header/model/reducerTypes';
import { IHeaderMaximizeChangedAction } from '_/renderer/state/header/model/actionTypes';
import { Hamburger } from './HamburgerMenu';
import { IEngineStatusReducer } from '_/renderer/state/engine-status/model/reducerTypes';
import {
	IEngineDevStatusAction,
	IEngineStartedAction,
} from '_/renderer/state/engine-status/model/actionTypes';
import { ThunkAction } from 'redux-thunk';
import {
	getDevEngineStatus,
	notifyEngineStarted,
} from '_/renderer/state/engine-status/EngineStatusActions';
import { StatusIndicator } from './StatusIndicator';

interface Props {
	maximizedClass: IHeaderMaximizedChangedReducer;
	changeHeaderMaximized: (maximizedClass: string) => IHeaderMaximizeChangedAction;
	engineStarted: IEngineStatusReducer;
	listenForEngineStart: () => IEngineStartedAction;
	getDevReloadEngineStatus: () => ThunkAction<void, {}, undefined, IEngineDevStatusAction>;
}

/**
 * Since we use a frameless **Electron** app, we have to implement a custom window top bar
 */
class Header extends PureComponent<Props> {
	constructor(props) {
		super(props);
		this.initToggleMaxRestoreButtons();
		this.checkForEngineStart();
	}

	/**
	 * Closes the **renderer**'s BrowserWindow
	 * @param event click event
	 */
	closeWindow = async (event: MouseEvent) => {
		event.preventDefault();

		const dialog = remote.dialog;
		const res = await dialog.showMessageBox({
			title: 'Thia',
			message: 'Are you sure you want to quit?',
			detail: "This will stop the AI Engine and all it's processes.",
			type: 'info',
			buttons: ['Yes', 'Cancel'],
		});
		if (res.response == 0) {
			await ipcRenderer.invoke('window:close');
		}
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
	renderEngineIcon = () => {
		if (this.props.engineStarted.value) {
			return (
				<Box
					className='engine-indicator'
					boxShadow='0 0 0 0 rgba(0, 0, 0, 1)'
					w='18px'
					h='18px'
					borderRadius='50%'
					bg='green.500'></Box>
			);
		} else {
			return <Spinner w='18px' h='18px' thickness='2px' color='red.500' />;
		}
	};
	render() {
		return (
			<Box
				zIndex='99'
				as='header'
				id='titlebar'
				pos='fixed'
				left='0'
				top='0'
				w='full'
				bg='gray.800'
				className={this.props.maximizedClass.value}>
				<Box
					w='full'
					h='full'
					display='grid'
					css={{ '-webkit-app-region': 'drag' }}
					gridTemplateColumns='auto 138px'>
					<Flex w='full' h='full'>
						<Hamburger />
						<Spacer />
						<Center mr='5'>
							<StatusIndicator onColor='pulse-green' offColor='pulse-red' />
						</Center>
					</Flex>
					<Box
						id='window-controls'
						d='grid'
						gridTemplateColumns='repeat(3, var(--header-icon-width))'
						position='absolute'
						top='0'
						right='0'
						h='full'
						css={{ '-webkit-app-region': 'no-drag' }}
						bg='gray.900'>
						<Box className='title-button' gridColumn='1' onClick={this.minimizeWindow}>
							<svg width='11' height='1' viewBox='0 0 11 1'>
								<path d='m11 0v1h-11v-1z' strokeWidth='.26208' />
							</svg>
						</Box>
						<Box className='title-button' gridColumn='2' onClick={this.maximizeWindow}>
							<svg width='10' height='10' viewBox='0 0 10 10'>
								<path
									d='m10-1.6667e-6v10h-10v-10zm-1.001 1.001h-7.998v7.998h7.998z'
									strokeWidth='.25'
								/>
							</svg>
						</Box>
						<Box
							className='title-button'
							gridColumn='2'
							id='restore-button'
							display='none'
							onClick={this.unmaximizeWindow}>
							<svg width='11' height='11' viewBox='0 0 11 11'>
								<path
									d='m11 8.7978h-2.2021v2.2022h-8.7979v-8.7978h2.2021v-2.2022h8.7979zm-3.2979-5.5h-6.6012v6.6011h6.6012zm2.1968-2.1968h-6.6012v1.1011h5.5v5.5h1.1011z'
									strokeWidth='.275'
								/>
							</svg>
						</Box>
						<Box
							gridColumn='3'
							className='title-button'
							id='close-button'
							onClick={this.closeWindow}>
							<svg width='12' height='12' viewBox='0 0 12 12'>
								<path
									d='m6.8496 6 5.1504 5.1504-0.84961 0.84961-5.1504-5.1504-5.1504 5.1504-0.84961-0.84961 5.1504-5.1504-5.1504-5.1504 0.84961-0.84961 5.1504 5.1504 5.1504-5.1504 0.84961 0.84961z'
									strokeWidth='.3'
								/>
							</svg>
						</Box>
					</Box>
				</Box>
			</Box>
		);
	}
}

const mapStateToProps = (state: IAppState) => {
	return {
		maximizedClass: state.headerMaximizedClass,
		engineStarted: state.engineStarted,
	};
};

export default connect(mapStateToProps, {
	changeHeaderMaximized,
	listenForEngineStart: notifyEngineStarted,
	getDevReloadEngineStatus: getDevEngineStatus,
})(Header);
