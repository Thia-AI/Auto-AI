/**
 * Entry point of the Election app.
 */
import * as path from 'path';
import * as url from 'url';
// eslint-disable-next-line import/no-extraneous-dependencies
import { BrowserWindow, app, ipcMain, Menu } from 'electron';

import EngineRequest from './api/engineRequestConfig';
import { EngineShellDev } from './engine-shell/engineShellDev';
import { EngineShellProd } from './engine-shell/engineShellProd';
import { EngineHandler } from './engine-shell/engineHandler';
import { menu } from './menu/menu';
import { MainWindowIPCActions } from './ipc/window-action/mainWindowIPCActions';
import { EngineActionHandler } from './ipc/engine-action/engineActionHandler';
import { EngineIPCActionHandler } from './ipc/engine-action/engineIPCActionHandler';
import { RUNTIME_GLOBALS } from './config/runtimeGlobals';

let mainWindow: BrowserWindow | null;
let engineShell: EngineShellProd | EngineShellDev;
let mainWindowIPCActions: MainWindowIPCActions;
let engineActionHandler: EngineActionHandler;
let engineIPCActionHandler: EngineIPCActionHandler;

const isDev = require('electron-is-dev');

initRendererDev(isDev);
/**
 * Creates the main window for **renderer**
 */
function createWindow(): void {
	// Create the browser window.
	mainWindow = new BrowserWindow({
		height: 768,
		width: 955,
		minHeight: 768,
		minWidth: 825,
		frame: false,
		icon: path.join(__dirname, '..', 'build', 'icon.ico'),
		backgroundColor: '#fff',
		webPreferences: {
			webSecurity: true,
			devTools: isDev,
			nodeIntegration: true,
		},
	});
	// replace menu with custom menu
	mainWindow.removeMenu();

	Menu.setApplicationMenu(menu);

	// must initialize IPC handler and Engine loading renderer
	initializeIPC();
	launchEngine();
	mainWindowIPCActions = new MainWindowIPCActions(mainWindow);
	mainWindowIPCActions.initIPCActions();

	// and load the index.html of the renderer
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
}

/**
 * Initializes IPC handler for development engine running check (so that when **Engine** is
 * running already, and developer reloads **renderer**, it doesn't get stuck on the 'Starting Engine' part)
 * @param isDev is **App** in development mode
 */
function initRendererDev(isDev: boolean): void {
	if (isDev) {
		ipcMain.handle('engine-dev:started', async () => {
			return RUNTIME_GLOBALS.engineRunning;
		});
	}
}

/**
 * Launches **Engine**
 */
function launchEngine(): void {
	/* eslint-disable  @typescript-eslint/no-unused-vars */
	if (isDev) {
		engineShell = EngineHandler.getInstance().createDevEngine(mainWindow, true);
	} else {
		engineShell = EngineHandler.getInstance().createProdEngine(mainWindow);
	}
	/* eslint-enable  @typescript-eslint/no-unused-vars */
}

/**
 * Initializes EngineActionHandler and EngineIPCActionHandler
 */
const initializeIPC = (): void => {
	engineActionHandler = EngineActionHandler.getInstance();
	engineActionHandler.initInstances(EngineRequest);

	engineIPCActionHandler = EngineIPCActionHandler.getInstance();
	engineIPCActionHandler.initIPCListening(engineActionHandler);
};

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', async () => {
	createWindow();
});

// Quit when all windows are closed.
app.on('window-all-closed', () => {
	// On OS X it is common for applications and their menu bar
	// to stay active until the user quits explicitly with Cmd + Q
	// not really needed since we aren't developing for darwin but it's fine
	// to keep it here, not harming anyone
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
