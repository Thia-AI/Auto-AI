import { AxiosError, AxiosInstance, AxiosRequestConfig } from 'axios';
import { ModelsCache } from '_/renderer/view/helpers/constants/engineTypes';
import { IEngineRequest } from '../../base/iEngineRequest';

class GetModelsCacheEngineRequest implements IEngineRequest {
	actionName: string;
	engineRequest: AxiosInstance;
	apiName: string;

	constructor(engineRequest: AxiosInstance) {
		this.engineRequest = engineRequest;
		this.actionName = 'Get Model Cache';
		this.apiName = '/models-cache';
	}

	run = async (config?: AxiosRequestConfig): Promise<[false, ModelsCache[]] | [true, any]> => {
		try {
			const res = await this.engineRequest.get(`${this.apiName}`, config);
			return [false, res.data];
		} catch (_err) {
			const err = _err as AxiosError;
			return [true, err.response?.data];
		}
	};
}

export { GetModelsCacheEngineRequest };
