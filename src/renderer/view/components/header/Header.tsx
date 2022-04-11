import React, { useEffect, MouseEvent } from 'react';
import { ipcRenderer, MessageBoxReturnValue } from 'electron';
import { connect } from 'react-redux';
import { Box, Center, Flex, Spacer } from '@chakra-ui/react';

import './Header.css';
import { IAppState } from '_/renderer/state/reducers';
import { changeHeaderMaximized } from '_state/header/HeaderActions';
import { IHeaderMaximizedChangedReducer } from '_/renderer/state/header/model/reducerTypes';
import { IHeaderMaximizeChangedAction } from '_/renderer/state/header/model/actionTypes';
import { Hamburger } from './HamburgerMenu';
import { IEngineStatusReducer } from '_/renderer/state/engine-status/model/reducerTypes';
import { IEngineStartedAction } from '_/renderer/state/engine-status/model/actionTypes';
import { getDevEngineStatus, notifyEngineStarted } from '_/renderer/state/engine-status/EngineStatusActions';
import { StatusIndicator } from './StatusIndicator';
import {
	IPC_ENGINE_STARTED,
	IPC_RUNTIME_IS_DEV,
	IPC_SHOW_CLOSE_WINDOW_DIALOG,
	IPC_WINDOW_CLOSED,
	IPC_WINDOW_MAXIMIZE,
	IPC_WINDOW_MAXIMIZED,
	IPC_WINDOW_MINIMIZE,
	IPC_WINDOW_UNMAXIMIZE,
	IPC_WINDOW_UNMAXIMIZED,
} from '_/shared/ipcChannels';
import { useSigninCheck } from 'reactfire';
import { IMenuOpenCloseAction } from '_/renderer/state/side-menu/model/actionTypes';
import { openCloseSideMenu } from '_/renderer/state/side-menu/SideModelAction';

interface Props {
	maximizedClass: IHeaderMaximizedChangedReducer;
	changeHeaderMaximized: (maximizedClass: string) => IHeaderMaximizeChangedAction;
	engineStarted: IEngineStatusReducer;
	listenForEngineStart: () => IEngineStartedAction;
	getDevReloadEngineStatus: () => void;
	openCloseSideMenu: () => IMenuOpenCloseAction;
}

const HeaderC = React.memo((props: Props) => {
	const { data: signInCheckResult } = useSigninCheck();

	useEffect(() => {
		initToggleMaxRestoreButtons();
		checkForEngineStart();
	}, []);

	useEffect(() => {
		const openSideMenu = (event: KeyboardEvent) => {
			if (event.key == 'Escape' && signInCheckResult && signInCheckResult.signedIn) {
				event.preventDefault();
				props.openCloseSideMenu();
			}
		};

		window.addEventListener('keydown', openSideMenu);

		return () => {
			window.removeEventListener('keydown', openSideMenu);
		};
	}, [signInCheckResult]);

	/**
	 * Closes the **renderer**'s BrowserWindow.
	 *
	 * @param event Click event.
	 */
	const closeWindow = async (event: MouseEvent) => {
		event.preventDefault();

		const res: MessageBoxReturnValue = await ipcRenderer.invoke(IPC_SHOW_CLOSE_WINDOW_DIALOG);

		if (res.response == 0) {
			await ipcRenderer.invoke(IPC_WINDOW_CLOSED);
		}
	};
	/**
	 * Unmaximizes the **renderer**'s BrowserWindow.
	 *
	 * @param event Click event.
	 */
	const unmaximizeWindow = async (event: MouseEvent) => {
		event.preventDefault();
		await ipcRenderer.invoke(IPC_WINDOW_UNMAXIMIZE);
	};
	/**
	 * Maximizes the **renderer**'s BrowserWindow.
	 *
	 * @param event Click event.
	 */
	const maximizeWindow = async (event: MouseEvent) => {
		event.preventDefault();
		await ipcRenderer.invoke(IPC_WINDOW_MAXIMIZE);
	};
	/**
	 * Minimizes the **renderer**'s BrowserWindow.
	 *
	 * @param event Click event.
	 */
	const minimizeWindow = async (event: MouseEvent) => {
		event.preventDefault();
		await ipcRenderer.invoke(IPC_WINDOW_MINIMIZE);
	};

	/**
	 * Initializes IPC for switching maximize and unmazimize buttons.
	 */
	const initToggleMaxRestoreButtons = () => {
		ipcRenderer.on(IPC_WINDOW_UNMAXIMIZED, () => {
			props.changeHeaderMaximized('');
		});

		ipcRenderer.on(IPC_WINDOW_MAXIMIZED, () => {
			props.changeHeaderMaximized('maximized');
		});
	};
	/**
	 * Register IPC for checking for **Engine** being started at creation of component.
	 */
	const checkForEngineStart = async () => {
		// only for dev environment when you reload the app with Ctrl+R
		// when engine has already started
		if (await ipcRenderer.invoke(IPC_RUNTIME_IS_DEV)) {
			props.getDevReloadEngineStatus();
		}

		ipcRenderer.on(IPC_ENGINE_STARTED, () => {
			props.listenForEngineStart();
		});
	};

	const displayLoggedInHeaderComponents = () => {
		if (signInCheckResult && signInCheckResult.signedIn)
			return (
				<Flex w='full' h='full'>
					<Hamburger />
					<Spacer />
					<Center mr='5'>
						<StatusIndicator onColor='pulse-green' offColor='pulse-red' />
					</Center>
				</Flex>
			);
		else return null;
	};
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
			className={props.maximizedClass.value}>
			<Box
				w='full'
				h='full'
				display='grid'
				css={{ '-webkit-app-region': 'drag' }}
				gridTemplateColumns='auto 138px'>
				{displayLoggedInHeaderComponents()}
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
					<Box className='title-button' gridColumn='1' onClick={minimizeWindow}>
						<svg width='11' height='1' viewBox='0 0 11 1'>
							<path d='m11 0v1h-11v-1z' strokeWidth='.26208' />
						</svg>
					</Box>
					<Box className='title-button' gridColumn='2' onClick={maximizeWindow}>
						<svg width='10' height='10' viewBox='0 0 10 10'>
							<path d='m10-1.6667e-6v10h-10v-10zm-1.001 1.001h-7.998v7.998h7.998z' strokeWidth='.25' />
						</svg>
					</Box>
					<Box
						className='title-button'
						gridColumn='2'
						id='restore-button'
						display='none'
						onClick={unmaximizeWindow}>
						<svg width='11' height='11' viewBox='0 0 11 11'>
							<path
								d='m11 8.7978h-2.2021v2.2022h-8.7979v-8.7978h2.2021v-2.2022h8.7979zm-3.2979-5.5h-6.6012v6.6011h6.6012zm2.1968-2.1968h-6.6012v1.1011h5.5v5.5h1.1011z'
								strokeWidth='.275'
							/>
						</svg>
					</Box>
					<Box gridColumn='3' className='title-button' id='close-button' onClick={closeWindow}>
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
});

const mapStateToProps = (state: IAppState) => {
	return {
		maximizedClass: state.headerMaximizedClass,
		engineStarted: state.engineStarted,
	};
};

HeaderC.displayName = 'Header';

/**
 * Since we use a frameless **Electron** app, we have to implement a custom window top bar
 */
export const Header = connect(mapStateToProps, {
	changeHeaderMaximized,
	listenForEngineStart: notifyEngineStarted,
	getDevReloadEngineStatus: getDevEngineStatus,
	openCloseSideMenu,
})(HeaderC);
