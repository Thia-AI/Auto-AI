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

	run = async (config?: AxiosRequestConfig, data?: string) => {
		try {
			const res = await this.engineRequest.delete(`${this.apiName}/${data}`, config);
			return [false, res.data];
		} catch (_err) {
			const err = _err as AxiosError;
			return [true, err.response?.data];
		}
	};
}
