import { AxiosError, AxiosInstance, AxiosRequestConfig } from 'axios';
import { IEngineRequest } from '../../base/iEngineRequest';

/**
 * Data for training a model.
 */
export interface ITrainModelData {
	/**
	 * `dataset_id` is only optional when resuming training.
	 */
	dataset_id?: string;
}

class TrainModelEngineRequest implements IEngineRequest {
	actionName: string;
	engineRequest: AxiosInstance;
	apiName: string;
	constructor(engineRequest: AxiosInstance) {
		this.engineRequest = engineRequest;
		this.actionName = 'Train Model';
		this.apiName = '/model';
	}

	run = async (config?: AxiosRequestConfig, data?: [string, string, ITrainModelData]) => {
		if (!data) return [false, { Error: 'Data cannot be undefined' }];

		try {
			const extendedAxiosConfig: AxiosRequestConfig = {
				...config,
				headers: {
					Authorization: `Bearer ${data[1]}`,
				},
			};
			const res = await this.engineRequest.post(`${this.apiName}/${data[0]}/train`, data[2], extendedAxiosConfig);
			return [false, res.data];
		} catch (_err) {
			const err = _err as AxiosError;
			return [true, err.response?.data];
		}
	};
}

export { TrainModelEngineRequest };
