import { AxiosError, AxiosInstance, AxiosRequestConfig } from 'axios';
import { IEngineRequest } from '../../base/iEngineRequest';

class CreateDatasetEngineRequest implements IEngineRequest {
	actionName: string;
	engineRequest: AxiosInstance;
	apiName: string;
	constructor(engineRequest: AxiosInstance) {
		this.engineRequest = engineRequest;
		this.actionName = 'Create Dataset';
		this.apiName = '/dataset/create';
	}

	run = async (config?: AxiosRequestConfig, data?: [string, object]) => {
		if (!data) return [false, { Error: 'Data cannot be undefined' }];

		try {
			const extendedAxiosConfig: AxiosRequestConfig = {
				...config,
				headers: {
					Authorization: `Bearer ${data[0]}`,
				},
			};
			const res = await this.engineRequest.post(`${this.apiName}`, data[1], extendedAxiosConfig);
			return [false, res.data];
		} catch (_err) {
			const err = _err as AxiosError;
			return [true, err.response?.data];
		}
	};
}

export { CreateDatasetEngineRequest };
