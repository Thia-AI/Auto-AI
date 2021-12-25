import { ipcMain } from 'electron';
import { RUNTIME_GLOBALS } from '../config/runtimeGlobals';
/**
 * Class that contains IPC actions pertaining to **Engine**
 */
class EngineIPCActionHandler {
	private static instance: EngineIPCActionHandler;

	/**
	 * Private constructor
	 */
	private constructor() {}

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
	 * Initializes EngineActions' respective methods to be ran for each IPC notification
	 * @param engineActionHandler EngineActionHandler to be set
	 */
	public initIPCListening = () => {
		ipcMain.handle('runtime:is-dev', async () => {
			return RUNTIME_GLOBALS.isDev;
		});
	};
}

export { EngineIPCActionHandler };
