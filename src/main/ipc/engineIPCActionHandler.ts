import { ipcMain, BrowserWindow } from 'electron';
import { Socket } from 'socket.io-client';
const isDev = require('electron-is-dev');
import {
	IPC_CONNECT_SOCKET,
	IPC_ENGINE_JOB_FINISHED,
	IPC_ENGINE_START,
	IPC_ENGINE_STOP,
	IPC_RUNTIME_IS_DEV,
} from '_/shared/ipcChannels';

import { RUNTIME_GLOBALS } from '../config/runtimeGlobals';
import { EngineHandler } from '../engine-shell/engineHandler';
import { EngineShellDev } from '../engine-shell/engineShellDev';
import { EngineShellProd } from '../engine-shell/engineShellProd';

/**
 * Class that contains IPC actions pertaining to **Engine**.
 */
class EngineIPCActionHandler {
	private window: BrowserWindow;

	/**
	 * Client Socket-IO for Engine's Socket-IO server.
	 */
	private socket: Socket;

	private engineShell: EngineShellDev | EngineShellProd | null;

	constructor(window: BrowserWindow, socket: Socket) {
		this.window = window;
		// Socket init
		this.socket = socket;
		this.engineShell = null;
		this.initSocketEvents(this.socket);
		this.initIPCListening();
	}

	/**
	 * Initializes socket event handlers.
	 *
	 * @param socket The {@link Socket `Socket`} instance.
	 */
	private initSocketEvents = (socket: Socket) => {
		socket.on('connect', () => {
			this.logCSIO('Connected:', socket.id);
		});

		socket.on('disconnect', () => {
			this.logCSIO('Disconnected:', socket.id);
		});

		socket.on('jobFinished', (jobID: string) => {
			// Job has finished, let the renderer know
			this.logCSIO('Job Finished:', jobID);
			this.window.webContents.send(IPC_ENGINE_JOB_FINISHED, jobID);
		});
	};
	/**
	 * Initializes EngineActions' respective methods to be ran for each IPC notification.
	 */
	private initIPCListening = () => {
		ipcMain.handle(IPC_RUNTIME_IS_DEV, async () => {
			return RUNTIME_GLOBALS.isDev;
		});

		ipcMain.handle(IPC_CONNECT_SOCKET, async () => {
			this.socket.connect();
		});

		ipcMain.handle(IPC_ENGINE_STOP, () => {
			if (this.engineShell) {
				console.log('ENGINE_STOP CALLED');
				this.engineShell.shutDownEngine();
				this.engineShell = null;
			}
		});

		ipcMain.handle(IPC_ENGINE_START, () => {
			this.launchEngine();
		});
	};

	/**
	 * Launches **Engine**.
	 */
	launchEngine = () => {
		/* eslint-disable  @typescript-eslint/no-unused-vars */
		if (isDev) {
			this.engineShell = EngineHandler.getInstance().createDevEngine(this.window);
		} else {
			this.engineShell = EngineHandler.getInstance().createProdEngine(this.window);
		}
		/* eslint-enable  @typescript-eslint/no-unused-vars */
	};

	/* eslint-disable @typescript-eslint/no-explicit-any */
	/**
	 * Logs Client-Side Socket-IO events.
	 *
	 * @param message Logging message.
	 * @param optionalParams The {@link Console.log `console.log`}'s optional parameters.
	 */
	private logCSIO = (message?: any, ...optionalParams: any[]) => {
		console.log('[CLIENT-SIO]:', message, ...optionalParams);
	};
	/* eslint-enable @typescript-eslint/no-explicit-any */
}

export { EngineIPCActionHandler };
