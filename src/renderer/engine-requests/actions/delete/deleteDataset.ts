import { AxiosError, AxiosInstance, AxiosRequestConfig } from 'axios';
import { IEngineRequest } from '../../base/iEngineRequest';

class DeleteDatasetEngineRequest implements IEngineRequest {
	actionName: string;
	engineRequest: AxiosInstance;
	apiName: string;

	constructor(engineRequest: AxiosInstance) {
		this.engineRequest = engineRequest;
		this.actionName = 'Delete Dataset';
		this.apiName = '/dataset';
	}

	run = async (config?: AxiosRequestConfig, data?: [string, string]) => {
		if (!data) return [false, { Error: 'Data cannot be undefined' }];

		try {
			const extendedAxiosConfig: AxiosRequestConfig = {
				...config,
				headers: {
					Authorization: `Bearer ${data[1]}`,
				},
			};
			const res = await this.engineRequest.delete(`${this.apiName}/${data[0]}`, extendedAxiosConfig);
			return [false, res.data];
		} catch (_err) {
			const err = _err as AxiosError;
			return [true, err.response?.data];
		}
	};
}

export { DeleteDatasetEngineRequest };
