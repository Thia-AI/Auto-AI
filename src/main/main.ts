/**
 * Entry point of the Election app.
 */
import * as path from 'path';
import * as url from 'url';
// eslint-disable-next-line import/no-extraneous-dependencies
import { BrowserWindow, app, ipcMain, Menu, protocol } from 'electron';
import { register } from 'electron-localshortcut';
import { io } from 'socket.io-client';
import { FirebaseApp, initializeApp } from 'firebase/app';
import { Express, NextFunction, RequestHandler, Response, Request } from 'express';
import { cpus } from 'os';
import installExtension, { REACT_DEVELOPER_TOOLS } from 'electron-devtools-installer';

import { EngineShellDev } from './engine-shell/engineShellDev';
import { EngineShellProd } from './engine-shell/engineShellProd';
import { EngineHandler } from './engine-shell/engineHandler';
import { menu } from './menu/menu';
import { WindowIPCActions } from './ipc/windowIPCActions';
import { EngineIPCActionHandler } from './ipc/engineIPCActionHandler';
import { RUNTIME_GLOBALS } from './config/runtimeGlobals';
import { isEmulatedDev } from './helpers/dev';
import { ReadFileTaskResult, READ_FILE, TaskResult, WorkerMap, WorkerTask } from '_/shared/workerConstants';
import {
	IPC_DEV_TOGGLE_DEV_DASHBOARD,
	IPC_DEV_ENGINE_STARTED,
	IPC_WORKER_READY,
	IPC_WORKER_READY_TO_INIT,
	IPC_WORKER_TASK_ASSIGNED,
	IPC_WORKER_TASK_DONE,
	IPC_WORKER_TASK_RECEIVED,
	IPC_SEND_AUTH_CREDENTIAL_TO_MAIN_RENDERER,
} from '_/shared/ipcChannels';
import { startServer } from './server/server';
import { OAuthCredential } from 'firebase/auth';
import { firebaseAdminConfig, firebaseConfig } from '_/renderer/firebase/firebase';
import { getFunctions, httpsCallable } from 'firebase/functions';

const numCPUs = cpus().length;

let firebaseApp: FirebaseApp | null;
let mainWindow: BrowserWindow | null;
let loginWindow: BrowserWindow | null;

let engineShell: EngineShellProd | EngineShellDev;
let mainWindowIPCActions: WindowIPCActions;
let engineIPCActionHandler: EngineIPCActionHandler;

const availableWorkers: BrowserWindow[] = [];
const workerMap: WorkerMap = {};
const workerTaskQueue: WorkerTask[] = [];

const isDev = require('electron-is-dev');

export const APP_NAME = 'Thia';

const engineJobsSIOConnection = io('http://localhost:8442/jobs', {
	path: '/socket.io',
	forceNew: true,
	timeout: 2000,
	autoConnect: false,
});

/**
 * Sets the app user model to Thia (used in windows to register the app name).
 */
const preRendererAppInit = () => {
	if (process.platform === 'win32') {
		app.setAppUserModelId(APP_NAME);
	}
};

preRendererAppInit();

/**
 * Creates the main window for **renderer**.
 */
const createWindow = (): void => {
	// Create the login browser window.
	loginWindow = new BrowserWindow({
		height: 640,
		width: 480,
		minHeight: 525,
		minWidth: 400,
		frame: true,
		show: false,
		title: 'Login',
		autoHideMenuBar: true,
	});
	// Create the main browser window.
	mainWindow = new BrowserWindow({
		height: 768,
		width: 955,
		minHeight: 650,
		minWidth: 825,
		frame: false,
		title: APP_NAME,
		autoHideMenuBar: true,
		show: false,
		icon: path.join(__dirname, '..', 'build', 'icon.ico'),
		backgroundColor: '#1A202C',
		webPreferences: {
			webSecurity: true,
			devTools: isEmulatedDev,
			nodeIntegration: true,
			contextIsolation: false,
			backgroundThrottling: false,
			nativeWindowOpen: true,
		},
	});

	// Shows BrowerWindow once page is fully loaded
	mainWindow.once('ready-to-show', () => {
		mainWindow?.show();
	});

	// replace menu with custom menu
	mainWindow.removeMenu();
	loginWindow.removeMenu();

	mainWindow.setMenu(menu);
	loginWindow.setMenu(menu);

	// must initialize IPC handler and Engine loading renderer
	launchEngine();

	engineIPCActionHandler = new EngineIPCActionHandler(mainWindow, engineJobsSIOConnection); // eslint-disable-line @typescript-eslint/no-unused-vars

	mainWindowIPCActions = new WindowIPCActions(mainWindow, loginWindow); // eslint-disable-line @typescript-eslint/no-unused-vars

	// and load the index.html of the renderer
	mainWindow
		.loadURL(
			url.format({
				pathname: path.join(__dirname, 'index.html'),
				protocol: 'file:',
				slashes: true,
			}),
		)
		.finally(() => {
			/* no action */
		});

	loginWindow?.loadURL('https://localhost:8443/login/login.html').finally(() => {
		// No action
	});

	// Emitted when the window is closed.
	mainWindow.on('closed', () => {
		// Dereference the window object, usually you would store windows
		// in an array if your app supports multi windows, this is the time
		// when you should delete the corresponding element.
		app.exit(1);
	});

	loginWindow.on('close', (e) => {
		e.preventDefault();
		loginWindow?.webContents.closeDevTools();
		loginWindow?.hide();
	});
};

/**
 * Creates a background worker from a hidden renderer.
 *
 * @returns Hidden renderer worker.
 */
const createWorker = () => {
	const browserWindowWorker = new BrowserWindow({
		show: false,
		frame: true,
		paintWhenInitiallyHidden: false,
		webPreferences: {
			webSecurity: true,
			devTools: isEmulatedDev,
			nodeIntegration: true,
			contextIsolation: false,
			backgroundThrottling: false,
		},
	});
	browserWindowWorker
		.loadURL(
			url.format({
				pathname: path.join(__dirname, 'worker.html'),
				protocol: 'file:',
				slashes: true,
			}),
		)
		.finally(() => {
			// Nothing
		});
	browserWindowWorker.on('closed', () => {
		console.log('Background Worker Closed');
	});
	browserWindowWorker.webContents.once('did-finish-load', () => {
		workerMap[browserWindowWorker.webContents.getOSProcessId()] = browserWindowWorker;
		browserWindowWorker.webContents.send(IPC_WORKER_READY_TO_INIT);
	});

	return browserWindowWorker;
};

const startWebServices = async () => {
	return startServer()
		.then(async (appServer) => {
			const server = appServer as Express;
			registerServerAPI(server, 'post', '/api/loginToken', apiPostLoginToken);
		})
		.catch((err) => {
			throw err;
		});
};

type ExpressMethods = 'get' | 'head' | 'post' | 'delete' | 'put' | 'connect' | 'options' | 'trace' | 'patch';

const apiPostLoginToken = async (req: Request, res: Response, next: NextFunction) => {
	const uid: string = req.body['uid'];
	if (firebaseApp) {
		const functions = getFunctions(firebaseApp);
		const getToken = httpsCallable(functions, 'customToken');
		const customParams = {
			userid: uid,
			serviceAccountId: firebaseAdminConfig.serviceAccountId,
			projectId: firebaseAdminConfig.projectId,
		};
		try {
			const result = await getToken(customParams);
			const customToken = result.data as string;
			// Send token to main window
			mainWindow?.webContents.send(IPC_SEND_AUTH_CREDENTIAL_TO_MAIN_RENDERER, customToken);
			loginWindow?.webContents.closeDevTools();
			loginWindow?.hide();
		} catch (error) {
			console.log('ERROR:', error);
		}
		res.status(200).send();
		return;
	}
	res.status(503).send('App not initialized');
	// mainWindow?.webContents.send(IPC_SEND_AUTH_CREDENTIAL_TO_MAIN_RENDERER, req.body);
	// loginWindow?.webContents.closeDevTools();
	// loginWindow?.hide();
};
const registerServerAPI = (server: Express, method: ExpressMethods, url: string, apiRouteFunction) => {
	console.log('Registering Server API');
	server[method](url, apiRouteFunction);
};
/**
 * Initializes IPC handler for development engine running check (so that when **Engine** is
 * running already, and developer reloads **renderer**, it doesn't get stuck on the 'Starting Engine' part).
 */
const initRendererDev = () => {
	if (isDev) {
		ipcMain.handle(IPC_DEV_ENGINE_STARTED, async () => {
			return RUNTIME_GLOBALS.engineRunning;
		});
	}
};

/**
 * Registers shortcuts (key presses) to certain actions.
 *
 * @param win - The {@link BrowserWindow `BrowserWindow`} to register key shortcuts.
 */
const registerShortcuts = (win: BrowserWindow) => {
	// Dev shortcuts
	if (isDev) {
		// Opens dev dashboard on renderer
		register(win, 'Ctrl+Shift+Q', () => {
			win.webContents.send(IPC_DEV_TOGGLE_DEV_DASHBOARD);
		});
	}
};
/**
 * Launches **Engine**.
 */
const launchEngine = () => {
	/* eslint-disable  @typescript-eslint/no-unused-vars */
	if (isDev) {
		engineShell = EngineHandler.getInstance().createDevEngine(mainWindow, true);
	} else {
		engineShell = EngineHandler.getInstance().createProdEngine(mainWindow);
	}
	/* eslint-enable  @typescript-eslint/no-unused-vars */
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
	app.whenReady().then(async () => {
		if (isDev) {
			const extension = await installExtension([REACT_DEVELOPER_TOOLS], {
				loadExtensionOptions: { allowFileAccess: true },
				forceDownload: true,
			});
			console.log('Extension loaded:', extension);
		}
		firebaseApp = initializeApp(firebaseConfig);
		await startWebServices();
		initRendererDev();
		createWindow();
		registerShortcuts(mainWindow!);
		protocol.registerFileProtocol('file', (req, callback) => {
			const pathname = decodeURIComponent(req.url.replace('file:///', ''));
			callback(pathname);
		});
		// Create worker for each cpu
		initWorkerIPC();

		for (let i = 0; i < numCPUs; i++) {
			const worker = createWorker();
			availableWorkers.push(worker);
		}
	});
}

/**
 * Sends task to next available workers and sends status update to renderer.
 */
const doTask = () => {
	while (availableWorkers.length > 0 && workerTaskQueue.length > 0) {
		const task = workerTaskQueue.shift();
		const nextWorker = availableWorkers.shift();

		nextWorker?.webContents.send(IPC_WORKER_TASK_RECEIVED, task);
	}
	mainWindow?.webContents.send('worker:status', availableWorkers.length, workerTaskQueue.length);
};

/**
 * Initializes worker IPC handles.
 */
const initWorkerIPC = () => {
	ipcMain.handle(IPC_WORKER_READY, (event) => {
		availableWorkers.push(workerMap[event.sender.getOSProcessId()]);
		doTask();
	});

	ipcMain.handle(IPC_WORKER_TASK_ASSIGNED, (event, task: WorkerTask) => {
		workerTaskQueue.push(task);
		doTask();
	});

	ipcMain.handle(IPC_WORKER_TASK_DONE, (event, result: TaskResult) => {
		if (result.type == READ_FILE) {
			result = result as ReadFileTaskResult;
			mainWindow?.webContents.send(`worker:taskDone_${result.filePath}`, result);
		}
	});
};

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
