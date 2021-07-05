import { AxiosError, AxiosInstance, AxiosRequestConfig } from 'axios';
import { IEngineAction } from '../../base/iEngineAction';

class CreateModelEngineAction implements IEngineAction {
	actionName: string;
	engineRequest: AxiosInstance;
	apiName: string;
	constructor(engineRequest: AxiosInstance) {
		this.engineRequest = engineRequest;
		this.actionName = 'Create Model';
		this.apiName = '/model/create';
	}

	run = async (config?: AxiosRequestConfig, data?: object) => {
		try {
			const res = await this.engineRequest.post(`${this.apiName}`, data, config);
			return [false, res.data];
		} catch (_err) {
			const err = _err as AxiosError;
			return [true, err.response?.data];
		}
	};
}

export { CreateModelEngineAction };
