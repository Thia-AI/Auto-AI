import { ipcMain, BrowserWindow } from 'electron';
import { Socket } from 'socket.io-client';

import { RUNTIME_GLOBALS } from '../config/runtimeGlobals';
/**
 * Class that contains IPC actions pertaining to **Engine**.
 */
class EngineIPCActionHandler {
	private window: BrowserWindow;

	/**
	 * Client Socket-IO for Engine's Socket-IO server.
	 */
	private socket: Socket;

	constructor(window: BrowserWindow, socket: Socket) {
		this.window = window;
		// Socket init
		this.socket = socket;
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
			this.window.webContents.send('engine:jobFinished', jobID);
		});
	};
	/**
	 * Initializes EngineActions' respective methods to be ran for each IPC notification.
	 */
	private initIPCListening = () => {
		ipcMain.handle('runtime:is-dev', async () => {
			return RUNTIME_GLOBALS.isDev;
		});

		ipcMain.handle('engine:connectSocket', async () => {
			// console.log('Trueszki');
			this.socket.connect();
		});
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
