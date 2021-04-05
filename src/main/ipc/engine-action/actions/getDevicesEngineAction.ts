import { AxiosInstance, AxiosRequestConfig, AxiosError } from 'axios';
import { IEngineAction } from '../base/iEngineAction';

class GetDevicesEngineAction implements IEngineAction {
	actionName: string;
	engineRequest: AxiosInstance;
	apiName: string;
	constructor(engineRequest: AxiosInstance) {
		this.engineRequest = engineRequest;
		this.actionName = 'Get Devices';
		this.apiName = 'getDevices';
	}
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
