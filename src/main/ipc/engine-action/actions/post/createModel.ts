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
	// eslint-disable-next-line  @typescript-eslint/no-explicit-any
	async run(config?: AxiosRequestConfig, data?: JSON): Promise<[boolean, any]> {
		try {
			const res = await this.engineRequest.post(`${this.apiName}`, data, config);
			console.log(res.data);
			return [false, res.data];
		} catch (_err) {
			const err = _err as AxiosError;
			return [true, err.response?.data];
		}
	}
}

export { CreateModelEngineAction };
