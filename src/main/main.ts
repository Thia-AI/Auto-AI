/**
 * Entry point of the Election app.
 */
import * as path from 'path';
import * as url from 'url';
// eslint-disable-next-line import/no-extraneous-dependencies
import { BrowserWindow, app, ipcMain, net } from 'electron';
import { Options, PythonShell } from 'python-shell';
import axios, { AxiosResponse } from 'axios';
import { spawn } from 'child_process';

import axiosEngine from './axiosEngineConfig';
let mainWindow: Electron.BrowserWindow | null;

let engine = spawn('ss');

let options: Options = {
	mode: 'text',
	pythonPath: 'python',
	pythonOptions: ['-u'],
	// scriptPath: path.join(__dirname, '../src/py'),
};

const isDev = process.env.NODE_ENV == 'development';

const engineShell = new PythonShell(
	path.join(__dirname, '../src/py', 'main.py'),
	options,
);

function createWindow(): void {
	console.log('.on');
	// Create the browser window.
	mainWindow = new BrowserWindow({
		height: 600,
		width: 800,
		webPreferences: {
			webSecurity: false,
			devTools: isDev,
			nodeIntegration: true,
		},
	});

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
		engineShell.on('message', (message) => {
			console.log(message);
		});

		engineShell.end((err, exitCode, exitSignal) => {
			if (err) throw err;
			console.log(
				`Engine Stopped, exit code was '${exitCode}', exit signal was '${exitSignal}'`,
			);
		});
	} else {
		console.log('Production Mode');
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
		resp = await axiosEngine.get('/');
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
