import { AxiosError, AxiosInstance, AxiosRequestConfig } from 'axios';
import { IEngineRequest } from '../../base/iEngineRequest';

/**
 * Engine Request to delete a model.
 */
export class DeleteModelEngineRequest implements IEngineRequest {
	actionName: string;
	engineRequest: AxiosInstance;
	apiName: string;

	constructor(engineRequest: AxiosInstance) {
		this.engineRequest = engineRequest;
		this.actionName = 'Delete Model';
		this.apiName = '/model';
	}

	run = async (config?: AxiosRequestConfig, data?: [string, string]) => {
		if (!data) return [false, { Error: 'Data cannot be undefined' }];

		const extendedAxiosConfig: AxiosRequestConfig = {
			...config,
			headers: {
				Authorization: `Bearer ${data[1]}`,
			},
		};
		try {
			const res = await this.engineRequest.delete(`${this.apiName}/${data[0]}`, extendedAxiosConfig);
			return [false, res.data];
		} catch (_err) {
			const err = _err as AxiosError;
			return [true, err.response?.data];
		}
	};
}
