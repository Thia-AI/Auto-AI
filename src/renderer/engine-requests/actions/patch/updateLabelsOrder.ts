import { AxiosError, AxiosInstance, AxiosRequestConfig } from 'axios';
import { IEngineRequest } from '../../base/iEngineRequest';

class UpdateLabelsOrderEngineRequest implements IEngineRequest {
	actionName: string;
	engineRequest: AxiosInstance;
	apiName: string;

	constructor(engineRequest: AxiosInstance) {
		this.engineRequest = engineRequest;
		this.actionName = 'Update Labels Order';
		this.apiName = '/dataset/';
	}

	run = async (config?: AxiosRequestConfig, data?: [string, object]) => {
		if (!data) return [true, { Error: 'Data cannot be undefined' }];

		try {
			const res = await this.engineRequest.patch(`${this.apiName}/${data[0]}/labels/order`, data[1], config);
			return [false, res.data];
		} catch (_err) {
			const err = _err as AxiosError;
			return [true, err.response?.data];
		}
	};
}

export { UpdateLabelsOrderEngineRequest };
