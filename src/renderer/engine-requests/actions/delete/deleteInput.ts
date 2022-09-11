import { AxiosError, AxiosInstance, AxiosRequestConfig } from 'axios';
import { IEngineRequest } from '../../base/iEngineRequest';

class DeleteInputEngineRequest implements IEngineRequest {
	actionName: string;
	engineRequest: AxiosInstance;
	apiName: string;
	constructor(engineRequest: AxiosInstance) {
		this.engineRequest = engineRequest;
		this.actionName = 'Delete Input';
		this.apiName = '/dataset';
	}

	run = async (config?: AxiosRequestConfig, data?: [string, string, string]) => {
		if (!data) return [false, { Error: 'Data cannot be undefined' }];

		try {
			const extendedAxiosConfig: AxiosRequestConfig = {
				...config,
				headers: {
					Authorization: `Bearer ${data[0]}`,
				},
			};
			const res = await this.engineRequest.delete(`${this.apiName}/${data[1]}/input/${data[2]}`, {
				...extendedAxiosConfig,
			});
			return [false, res.data];
		} catch (_err) {
			const err = _err as AxiosError;
			return [true, err.response?.data];
		}
	};
}

export { DeleteInputEngineRequest };
