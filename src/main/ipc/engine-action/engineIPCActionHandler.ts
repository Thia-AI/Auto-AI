import { ipcMain } from 'electron';
import { EngineActionHandler } from './engineActionHandler';

/**
 * Class that manages EngineActions called by **renderer** through IPC
 */
class EngineIPCActionHandler {
	private static instance: EngineIPCActionHandler;
	private _engineActionHandler!: EngineActionHandler;

	/**
	 * Private constructor
	 */
	private constructor() {}

	/**
	 * Getter for _engineActionHandler instance
	 */
	get actionHandler() {
		return this._engineActionHandler;
	}

	/**
	 * Setter for _engienActionhandler instance
	 */
	set actionHandler(eAH: EngineActionHandler) {
		this._engineActionHandler = eAH;
	}

	/**
	 * Gives you the EngineIPCActionHandler instance from anywhere in **App** with
	 * `EngineIPCActionHandler.getInstance();`
	 * @returns singleton EngineIPCActionHandler instance
	 */
	public static getInstance(): EngineIPCActionHandler {
		if (!EngineIPCActionHandler.instance) {
			EngineIPCActionHandler.instance = new EngineIPCActionHandler();
		}

		return EngineIPCActionHandler.instance;
	}

	/**
	 * Initializes the current instance's EngineActionHandler instance
	 * @param engineActionHandler EngineActionHandler to be set
	 */
	private initEngineActionHandler = (engineActionHandler: EngineActionHandler) => {
		this.actionHandler = engineActionHandler;
	};

	/**
	 * Initializes EngineActions' respective methods to be ran for each IPC notification
	 * @param engineActionHandler EngineActionHandler to be set
	 */
	public initIPCListening = (engineActionHandler: EngineActionHandler) => {
		this.initEngineActionHandler(engineActionHandler);

		ipcMain.handle('engine-action:getDevices', async () => {
			const devices = await this.actionHandler.getDevices();

			return JSON.stringify(devices);
		});
	};
}

export { EngineIPCActionHandler };
