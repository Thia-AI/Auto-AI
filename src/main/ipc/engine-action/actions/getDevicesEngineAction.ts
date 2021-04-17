import { AxiosInstance, AxiosRequestConfig } from 'axios';
import { IEngineAction } from '../base/iEngineAction';

/**
 * EngineAction class for to run 'GET /getDevices' route on **Engine**
 */
class GetDevicesEngineAction implements IEngineAction {
	actionName: string;
	engineRequest: AxiosInstance;
	apiName: string;
	/**
	 * Instantiates `/getDevices` request
	 * @param engineRequest an AxiosInstance representing an EngineRequest
	 */
	constructor(engineRequest: AxiosInstance) {
		this.engineRequest = engineRequest;
		this.actionName = 'Get Devices';
		this.apiName = 'getDevices';
	}
	/**
	 * Gets devices that are connected to **Engine**
	 * @param config configuration to append to engineRequest
	 * @returns devices that are connected to **Engine**
	 */
	async run(config?: AxiosRequestConfig): Promise<object[]> {
		try {
			const res = await this.engineRequest.get(`/${this.apiName}`, config);
			return res.data;
		} catch (err) {
			// return ErrorHandler(error);
			throw err;
		}
	}
}

export { GetDevicesEngineAction };
