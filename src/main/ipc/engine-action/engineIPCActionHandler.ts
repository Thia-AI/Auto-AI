import { ipcMain } from 'electron';
import { EngineActionHandler } from './engineActionHandler';

class EngineIPCActionHandler {
	private static instance: EngineIPCActionHandler;
	private _engineActionHandler!: EngineActionHandler;
	private constructor() {}

	get actionHandler() {
		return this._engineActionHandler;
	}

	set actionHandler(eAH: EngineActionHandler) {
		this._engineActionHandler = eAH;
	}

	public static getInstance(): EngineIPCActionHandler {
		if (!EngineIPCActionHandler.instance) {
			EngineIPCActionHandler.instance = new EngineIPCActionHandler();
		}

		return EngineIPCActionHandler.instance;
	}
	private initEngineActionHandler = (engineActionHandler: EngineActionHandler) => {
		this.actionHandler = engineActionHandler;
	};
	public initIPCListening = (engineActionHandler: EngineActionHandler) => {
		this.initEngineActionHandler(engineActionHandler);

		ipcMain.handle('engine-action:getDevices', async () => {
			let devices = await this.actionHandler.getDevices();

			return JSON.stringify(devices);
		});
	};
}

export { EngineIPCActionHandler };
