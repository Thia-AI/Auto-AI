import { AxiosInstance } from 'axios';
import { GetDevicesEngineAction } from './actions/getDevicesEngineAction';
import { IEngineAction } from './base/iEngineAction';

class EngineActionHandler {
	private static instance: EngineActionHandler;
	private getDevicesEA!: IEngineAction;
	private _engineRequest!: AxiosInstance;
	private constructor() {}

	public static getInstance(): EngineActionHandler {
		if (!EngineActionHandler.instance) {
			EngineActionHandler.instance = new EngineActionHandler();
		}

		return EngineActionHandler.instance;
	}

	get engineRequest() {
		return this._engineRequest;
	}

	set engineRequest(eR: AxiosInstance) {
		this._engineRequest = eR;
	}

	public initInstances = (eR: AxiosInstance) => {
		this.engineRequest = eR;
		this.getDevicesEA = new GetDevicesEngineAction(this._engineRequest);
	};

	public getDevices = async (): Promise<object[]> => {
		return await this.getDevicesEA.run();
	};
}

export { EngineActionHandler };
