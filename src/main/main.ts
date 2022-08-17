/**
 * Entry point of the Election app.
 */
import * as path from 'path';
import * as url from 'url';
// eslint-disable-next-line import/no-extraneous-dependencies
import { BrowserWindow, app, ipcMain, protocol, shell } from 'electron';
import { register } from 'electron-localshortcut';
import { io } from 'socket.io-client';
import { FirebaseApp, initializeApp } from 'firebase/app';
import { Express, Response, Request } from 'express';
import { autoUpdater } from 'electron-updater';
import log, { ElectronLog } from 'electron-log';
import { cpus } from 'os';
import installExtension, { REACT_DEVELOPER_TOOLS } from 'electron-devtools-installer';

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
	IPC_DEV_COPY_ID_TOKEN,
	IPC_DEV_COPY_UID,
	IPC_INFORM_UPDATE_NOT_AVAILABLE,
	IPC_DEV_TOGGLE_COLOR_MODE,
	IPC_INFORM_UPDATE_AVAILABLE,
	IPC_AUTO_UPDATE_DOWNLOAD_PROGRESS_INFO,
	IPC_AUTO_UPDATE_DOWNLOAD_CANCELLED,
	IPC_AUTO_UPDATE_ERROR,
} from '_/shared/ipcChannels';
import { LOGIN_WINDOW_LOGIN_WORKFLOW_COMPLETE, PERSISTENCE_TYPE } from '_/shared/appConstants';
import { startServer } from './server/server';
import { getFirebaseConfig, getFirebaseCustomTokenConfig } from '_/renderer/firebase/firebase';
import { getFunctions, httpsCallable } from 'firebase/functions';
import { Server } from 'socket.io';
import { ActivityStoreManager } from './store/activityStoreManager';

const numCPUs = cpus().length;

let firebaseAppProd: FirebaseApp | null;
let mainWindow: BrowserWindow | null;
let loginWindow: BrowserWindow | null;
let activityStoreManager: ActivityStoreManager | null;

let mainWindowIPCActions: WindowIPCActions;
let engineIPCActionHandler: EngineIPCActionHandler;

const availableWorkers: BrowserWindow[] = [];
const workerMap: WorkerMap = {};
const workerTaskQueue: WorkerTask[] = [];

const isDev = require('electron-is-dev');

autoUpdater.logger = log;
autoUpdater.autoDownload = false;
const autoUpdaterLogger = autoUpdater.logger as ElectronLog;
autoUpdaterLogger.transports.file.level = 'info';

// Disable IPC logging
if (log.transports.ipc) {
	log.transports.ipc.level = false;
}

if (isDev) {
	/**
	 * Resolve logging path to correct path in dev mode.
	 *
	 * @returns Path to log file.
	 */
	log.transports.file.resolvePath = () => path.join(app.getPath('userData'), 'logs', 'main.log');
}

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
		height: 720,
		width: 480,
		minHeight: 625,
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
		backgroundColor: '#1F1F1F',
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

	// Triggers when link is opened
	mainWindow.webContents.on('will-navigate', (e, urlDestination) => {
		const parsedUrl = new url.URL(urlDestination);
		if (parsedUrl.protocol !== 'file:') {
			e.preventDefault();
			shell.openExternal(urlDestination);
		}
	});

	// Triggers when loadUrl is fired and when react-router route is changed
	mainWindow.webContents.on('did-navigate-in-page', (e, urlDestination) => {
		const parsedUrl = new url.URL(urlDestination);
		if (parsedUrl.protocol !== 'file:') {
			e.preventDefault();
			shell.openExternal(urlDestination);
		}
	});

	// must initialize IPC handler and Engine loading renderer

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

/**
 * Sets up stores from `electron-store`.
 */
const setupStores = () => {
	activityStoreManager = new ActivityStoreManager(); // eslint-disable-line @typescript-eslint/no-unused-vars
};

/**
 * Starts HTTPS server controlled by **main** and registers its APIs.
 *
 * @returns Promise that resolves when server is started and APIs are registered.
 */
const startWebServices = async (): Promise<void> => {
	return (
		startServer()
			// eslint-disable-next-line @typescript-eslint/no-explicit-any
			.then(async (webServicesReturnArray: any) => {
				const server = webServicesReturnArray[0] as Express;
				const io = webServicesReturnArray[1] as Server;
				registerServerAPI(server, 'post', '/api/loginToken', apiPostLoginToken, io);
			})
			.catch((err) => {
				throw err;
			})
	);
};

/**
 * Different types of Express HTTP methods.
 */
type ExpressMethods = 'get' | 'head' | 'post' | 'delete' | 'put' | 'connect' | 'options' | 'trace' | 'patch';

/**
 * API for creating custom tokens after authenticating with firebase.
 * Passes custom token to the main **renderer**.
 *
 * @param req Express request object.
 * @param res Express response object.
 * @param io Socket-IO server instance.
 * @returns Promise.
 */
const apiPostLoginToken = async (req: Request, res: Response, io: Server) => {
	const uid: string = req.body['uid'];
	const persistence: PERSISTENCE_TYPE = req.body['persistence'];
	if (firebaseAppProd) {
		const functions = getFunctions(firebaseAppProd);
		const getToken = httpsCallable(functions, 'customToken');
		const firebaseCustomTokenConfig = getFirebaseCustomTokenConfig();
		const customParams = {
			userid: uid,
			serviceAccountId: firebaseCustomTokenConfig.serviceAccountId,
			projectId: firebaseCustomTokenConfig.projectId,
		};
		try {
			const result = await getToken(customParams);
			const customToken = result.data as string;
			// Send login finished event to login window
			io.emit(LOGIN_WINDOW_LOGIN_WORKFLOW_COMPLETE);
			// Send token to main window
			mainWindow?.webContents.send(IPC_SEND_AUTH_CREDENTIAL_TO_MAIN_RENDERER, customToken, persistence);
			loginWindow?.webContents.closeDevTools();
			loginWindow?.hide();
			mainWindow?.focus();
		} catch (error) {
			console.log('ERROR:', error);
		}
		res.status(200).send();
		return;
	}
	res.status(503).send('App not initialized');
};

/**
 * Registers an Express API to an Express server.
 *
 * @param server Express server.
 * @param method HTTP method type.
 * @param url URL to register API function to.
 * @param apiRouteFunction API function.
 * @param extraParams Extra parameters that are passed to the `apiRouteFunction`.
 */
const registerServerAPI = (server: Express, method: ExpressMethods, url: string, apiRouteFunction, ...extraParams) => {
	console.log('Registering Server API');
	server[method](url, (req, res) => {
		return apiRouteFunction(req, res, ...extraParams);
	});
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

		register(win, 'Ctrl+Shift+T', () => {
			win.webContents.send(IPC_DEV_COPY_ID_TOKEN);
		});

		register(win, 'Ctrl+Shift+U', () => {
			win.webContents.send(IPC_DEV_COPY_UID);
		});

		register(win, 'Ctrl+Shift+D', () => {
			win.webContents.send(IPC_DEV_TOGGLE_COLOR_MODE);
		});
	}
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
			try {
				const extension = await installExtension([REACT_DEVELOPER_TOOLS], {
					loadExtensionOptions: { allowFileAccess: true },
					forceDownload: true,
				});
				console.log('Extension loaded:', extension);
			} catch (err) {
				console.log('Error loading extensions: ', err);
			}
			autoUpdater.updateConfigPath = path.join(__dirname, '../', 'dev-app-update.yml');
			Object.defineProperty(app, 'isPackaged', {
				/**
				 * Override getter for app.isPackaged in development mode.
				 *
				 * @returns True.
				 */
				get() {
					return true;
				},
			});
		}

		const firebaseConfig = getFirebaseConfig();
		firebaseAppProd = initializeApp(firebaseConfig);
		await startWebServices();
		await setupStores();
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

autoUpdater.on('update-available', (updateInfo) => {
	log.info(`Update ${updateInfo.version} available`);

	mainWindow?.webContents.send(IPC_INFORM_UPDATE_AVAILABLE, updateInfo.version);
});

autoUpdater.on('update-not-available', (updateInfo) => {
	log.info(`Update ${updateInfo.version} not available`);
	mainWindow?.webContents.send(IPC_INFORM_UPDATE_NOT_AVAILABLE, updateInfo.version);
});

autoUpdater.on('download-progress', (progressInfo) => {
	let downloadLog = 'Download speed: ' + progressInfo.bytesPerSecond;
	downloadLog = downloadLog + ' - Downloaded ' + progressInfo.percent + '%';
	downloadLog = downloadLog + ' (' + progressInfo.transferred + '/' + progressInfo.total + ')';
	log.debug(downloadLog);
	mainWindow?.webContents.send(IPC_AUTO_UPDATE_DOWNLOAD_PROGRESS_INFO, progressInfo);
});

autoUpdater.on('update-downloaded', async () => {
	log.info('Update downloaded, quitting and installing');
	await autoUpdater.quitAndInstall(false, true);
});

autoUpdater.on('update-cancelled', () => {
	log.warn('Update cancelled');
	mainWindow?.webContents.send(IPC_AUTO_UPDATE_DOWNLOAD_CANCELLED);
});

autoUpdater.on('error', (error) => {
	log.error(`Error with auto update. Name: ${error.name}, Cause: ${error.cause}, Message: ${error.message}`);
	mainWindow?.webContents.send(IPC_AUTO_UPDATE_ERROR, error);
});
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
