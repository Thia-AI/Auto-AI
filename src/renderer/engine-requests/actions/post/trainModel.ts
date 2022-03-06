import { AxiosError, AxiosInstance, AxiosRequestConfig } from 'axios';
import { IEngineAction } from '../../base/iEngineAction';

/**
 * Data for training a model.
 */
export interface ITrainModelData {
	dataset_id: string;
}

class TrainModelEngineAction implements IEngineAction {
	actionName: string;
	engineRequest: AxiosInstance;
	apiName: string;
	constructor(engineRequest: AxiosInstance) {
		this.engineRequest = engineRequest;
		this.actionName = 'Train Model';
		this.apiName = '/model';
	}

	run = async (config?: AxiosRequestConfig, data?: [string, ITrainModelData]) => {
		if (!data) return [false, { Error: 'Data cannot be undefined' }];

		try {
			const res = await this.engineRequest.post(`${this.apiName}/${data[0]}/train`, data[1], config);
			return [false, res.data];
		} catch (_err) {
			const err = _err as AxiosError;
			return [true, err.response?.data];
		}
	};
}

export { TrainModelEngineAction };
