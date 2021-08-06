/**
 * Entry point of the Election app.
 */
import * as path from 'path';
import * as url from 'url';
// eslint-disable-next-line import/no-extraneous-dependencies
import { BrowserWindow, app, ipcMain, Menu } from 'electron';
import { register } from 'electron-localshortcut';

import { EngineShellDev } from './engine-shell/engineShellDev';
import { EngineShellProd } from './engine-shell/engineShellProd';
import { EngineHandler } from './engine-shell/engineHandler';
import { menu } from './menu/menu';
import { MainWindowIPCActions } from './ipc/window-action/mainWindowIPCActions';
import { EngineIPCActionHandler } from './ipc/engineIPCActionHandler';
import { RUNTIME_GLOBALS } from './config/runtimeGlobals';
import { isEmulatedDev } from './helpers/dev';

let mainWindow: BrowserWindow | null;
let engineShell: EngineShellProd | EngineShellDev;
let mainWindowIPCActions: MainWindowIPCActions;
let engineIPCActionHandler: EngineIPCActionHandler;

const isDev = require('electron-is-dev');

export const APP_NAME = 'Thia';

const preRendererAppInit = () => {
	if (process.platform === 'win32') {
		app.setAppUserModelId(APP_NAME);
	}
};

preRendererAppInit();

/**
 * Creates the main window for **renderer**
 */
function createWindow(): void {
	// See https://github.com/electron/electron/issues/24073 for why we set this
	// to false
	app.allowRendererProcessReuse = false;
	// Create the browser window.
	mainWindow = new BrowserWindow({
		height: 768,
		width: 955,
		minHeight: 650,
		minWidth: 825,
		frame: false,

		show: false,
		icon: path.join(__dirname, '..', 'build', 'icon.ico'),
		backgroundColor: '#1A202C',
		webPreferences: {
			webSecurity: true,
			devTools: isEmulatedDev,
			nodeIntegration: true,
			contextIsolation: false,
			backgroundThrottling: false,
			enableRemoteModule: true,
			nodeIntegrationInWorker: true,
		},
	});

	// Shows BrowerWindow once page is fully loaded
	mainWindow.once('ready-to-show', () => {
		mainWindow?.show();
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
 */
const initRendererDev = () => {
	if (isDev) {
		ipcMain.handle('engine-dev:started', async () => {
			return RUNTIME_GLOBALS.engineRunning;
		});
	}
};

/**
 * Registers shortcuts (key presses) to certain actions
 * @param win the {@link BrowserWindow `BrowserWindow`} to register key shortcuts
 */
const registerShortcuts = (win: BrowserWindow) => {
	// Dev shortcuts
	if (isDev) {
		// Opens dev dashboard on renderer
		register(win, 'Ctrl+Shift+Q', () => {
			win.webContents.send('dev:dashboard-toggle');
		});
	}
};
/**
 * Launches **Engine**
 */
const launchEngine = () => {
	/* eslint-disable  @typescript-eslint/no-unused-vars */
	if (isDev) {
		engineShell = EngineHandler.getInstance().createDevEngine(mainWindow);
	} else {
		engineShell = EngineHandler.getInstance().createProdEngine(mainWindow);
	}
	/* eslint-enable  @typescript-eslint/no-unused-vars */
};

/**
 * Initializes EngineActionHandler and EngineIPCActionHandler
 */
const initializeIPC = () => {
	engineIPCActionHandler = EngineIPCActionHandler.getInstance();
	engineIPCActionHandler.initIPCListening();
};

// Returns true if this instance of the App is the primary,
// false if an instance already exists.
const isSingleInstance = app.requestSingleInstanceLock();

if (!isSingleInstance) {
	app.quit();
} else {
	// This method focuses/maximized the primary instance
	// if the user tires to run a second instance.
	app.on('second-instance', () => {
		if (mainWindow) {
			if (mainWindow.isMaximized()) {
				mainWindow.restore();
			}
			mainWindow.focus();
		}
	});

	// This method will be called when Electron has finished
	// initialization and is ready to create browser windows.
	// Some APIs can only be used after this event occurs.
	app.on('ready', async () => {
		initRendererDev();

		createWindow();
		registerShortcuts(mainWindow!);
	});
}

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
