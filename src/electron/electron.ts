/**
 * Entry point of the Election app.
 */
import * as path from 'path';
import * as url from 'url';
// eslint-disable-next-line import/no-extraneous-dependencies
import { BrowserWindow, app, ipcMain, Menu, MenuItem } from 'electron';
import axios, { AxiosResponse } from 'axios';

import engineRequest from './api/engineRequestConfig';
import { EngineShellDev } from './engine-shell/engineShellDev';
import { EngineShellProd } from './engine-shell/engineShellProd';
import { EngineHandler } from './engine-shell/engineHandler';
import { menu } from './menu/menu';

let mainWindow: Electron.BrowserWindow | null;
let engineShell: EngineShellProd | EngineShellDev;

const isDev = require('electron-is-dev');

function createWindow(): void {
	// Create the browser window.
	mainWindow = new BrowserWindow({
		height: 800,
		width: 900,
		frame: false,
		backgroundColor: '#fff',
		webPreferences: {
			webSecurity: false,
			devTools: isDev,
			nodeIntegration: true,
		},
	});

	mainWindow.removeMenu();

	Menu.setApplicationMenu(menu);

	// and load the index.html of the app.
	mainWindow
		.loadURL(
			url.format({
				pathname: path.join(__dirname, './index.html'),
				protocol: 'file:',
				slashes: true,
			}),
		)
		.finally(() => {
			/* no action */
		});

	// Emitted when the window is closed.
	mainWindow.on('closed', () => {
		// Dereference the window object, usually you would store windows
		// in an array if your app supports multi windows, this is the time
		// when you should delete the corresponding element.
		mainWindow = null;
	});
	launchEngine();
	initializeIPC();
}

function launchEngine(): void {
	if (isDev) {
		engineShell = EngineHandler.getInstance().createDevEngine();
	} else {
		engineShell = EngineHandler.getInstance().createProdEngine();
	}
}

const initializeIPC = (): void => {
	ipcMain.on('test-python:run', (event) => {
		getEngineRuntime()
			.then((resp) => {
				mainWindow?.webContents.send('test-python:run', resp.data);
			})
			.catch((err) => {
				console.error(err);
			});
	});
};

const getEngineRuntime = async (): Promise<AxiosResponse> => {
	let resp: AxiosResponse | any;
	try {
		resp = await engineRequest.get('/');
	} catch (err) {
		console.error(err);
	}
	return resp;
};

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', createWindow);

// Quit when all windows are closed.
app.on('window-all-closed', () => {
	// On OS X it is common for applications and their menu bar
	// to stay active until the user quits explicitly with Cmd + Q
	if (process.platform !== 'darwin') {
		app.quit();
	}
});

app.on('activate', () => {
	// On OS X it"s common to re-create a window in the app when the
	// dock icon is clicked and there are no other windows open.
	if (mainWindow === null) {
		createWindow();
	}
});

// In this file you can include the rest of your app"s specific main process
// code. You can also put them in separate files and require them here.
