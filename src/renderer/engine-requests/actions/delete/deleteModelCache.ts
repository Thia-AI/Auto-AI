import { AxiosError, AxiosInstance, AxiosRequestConfig } from 'axios';
import { EngineRequestError } from '_/renderer/view/helpers/constants/engineTypes';
import { IEngineRequest } from '../../base/iEngineRequest';

class DeleteModelCacheEngineRequest implements IEngineRequest {
	actionName: string;
	engineRequest: AxiosInstance;
	apiName: string;

	constructor(engineRequest: AxiosInstance) {
		this.engineRequest = engineRequest;
		this.actionName = 'Delete Model Cache';
		this.apiName = '/models-cache';
	}

	run = async (config?: AxiosRequestConfig, data?: string): Promise<[false, string] | [true, EngineRequestError]> => {
		try {
			const res = await this.engineRequest.delete(`${this.apiName}/${data}`, config);
			return [false, res.data];
		} catch (_err) {
			const err = _err as AxiosError;
			return [true, err.response?.data];
		}
	};
}

export { DeleteModelCacheEngineRequest };
