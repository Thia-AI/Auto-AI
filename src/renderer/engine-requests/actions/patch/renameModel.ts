import { AxiosError, AxiosInstance, AxiosRequestConfig } from 'axios';
import { EngineRequestError, Model } from '_/renderer/view/helpers/constants/engineTypes';
import { IEngineRequest } from '../../base/iEngineRequest';

/**
 * Data added to request when renaming a model.
 */
export interface IRenameModelData {
	new_model_name: string;
}

class RenameModelEngineRequest implements IEngineRequest {
	actionName: string;
	engineRequest: AxiosInstance;
	apiName: string;

	constructor(engineRequest: AxiosInstance) {
		this.engineRequest = engineRequest;
		this.actionName = 'Rename Model';
		this.apiName = '/model';
	}

	run = async (
		config?: AxiosRequestConfig,
		data?: [string, IRenameModelData],
	): Promise<[false, Model] | [true, EngineRequestError]> => {
		if (!data) return [true, { Error: 'Data cannot be undefined' }];

		try {
			const res = await this.engineRequest.patch(`${this.apiName}/${data[0]}/rename`, data[1], config);
			return [false, res.data];
		} catch (_err) {
			const err = _err as AxiosError;
			return [true, err.response?.data];
		}
	};
}

export { RenameModelEngineRequest };
