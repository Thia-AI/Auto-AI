import { AxiosInstance, AxiosRequestConfig } from 'axios';
import { GetDevicesEngineAction } from './actions/get/getDevices';
import { GetJobEngineAction } from './actions/get/getJob';
import { CreateModelEngineAction } from './actions/post/createModel';
import { IEngineAction } from './base/iEngineAction';

/**
 * Class that manages all EngineActions
 */
class EngineActionHandler {
	private static instance: EngineActionHandler;

	private getDevicesEA!: IEngineAction;
	private createModelEA!: IEngineAction;
	private getJobEA!: IEngineAction;

	private _engineRequest!: AxiosInstance;

	/**
	 * Private constructor
	 */
	private constructor() {}

	/**
	 * Gives you the EngineActionHandler instance from anywhere in **App** with
	 * `EngineActionHandler.getInstance();`
	 * @returns singleton EngineActionHandler instance
	 */
	public static getInstance(): EngineActionHandler {
		if (!EngineActionHandler.instance) {
			EngineActionHandler.instance = new EngineActionHandler();
		}

		return EngineActionHandler.instance;
	}

	/**
	 * Getter for _engineRequest
	 */
	get engineRequest() {
		return this._engineRequest;
	}

	/**
	 * Setter for _engineRequest
	 */
	set engineRequest(eR: AxiosInstance) {
		this._engineRequest = eR;
	}

	/**
	 * Initializes EngineActionHandler
	 * @param eR engineRequest instance to set as the AxiosInstance to use for EngineActions
	 */
	public initInstances = (eR: AxiosInstance) => {
		this.engineRequest = eR;
		this.getDevicesEA = new GetDevicesEngineAction(this._engineRequest);
		this.createModelEA = new CreateModelEngineAction(this._engineRequest);
		this.getJobEA = new GetJobEngineAction(this._engineRequest);
	};

	/**
	 * Calls GetDevicesEngineAction's `run()` method
	 * @param config configuration to use for running `/devices` EngineAction
	 * @returns data returned by GetDevicesEngineAction
	 */
	public getDevices = async (config?: AxiosRequestConfig): Promise<object[]> => {
		return this.getDevicesEA.run(config);
	};

	public createModel = async (data: JSON, config?: AxiosRequestConfig) => {
		return this.createModelEA.run(config, data);
	};

	public getJob = async (uuid: string, config?: AxiosRequestConfig) => {
		return this.getJobEA.run(config, uuid);
	};
}

export { EngineActionHandler };
