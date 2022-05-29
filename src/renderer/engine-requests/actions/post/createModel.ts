import { AxiosError, AxiosInstance, AxiosRequestConfig } from 'axios';
import { IEngineRequest } from '../../base/iEngineRequest';

/**
 * Data for creating a new model.
 */
export interface CreateModelData {
	model_name: string;
	model_type: string;
	model_type_extra: string;
	labelling_type: string;
}
class CreateModelEngineRequest implements IEngineRequest {
	actionName: string;
	engineRequest: AxiosInstance;
	apiName: string;
	constructor(engineRequest: AxiosInstance) {
		this.engineRequest = engineRequest;
		this.actionName = 'Create Model';
		this.apiName = '/model/create';
	}

	run = async (config?: AxiosRequestConfig, data?: CreateModelData) => {
		try {
			const res = await this.engineRequest.post(`${this.apiName}`, data, config);
			return [false, res.data];
		} catch (_err) {
			const err = _err as AxiosError;
			return [true, err.response?.data];
		}
	};
}

export { CreateModelEngineRequest };
