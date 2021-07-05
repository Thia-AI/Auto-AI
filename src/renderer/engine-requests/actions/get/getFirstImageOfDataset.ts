import { AxiosError, AxiosInstance, AxiosRequestConfig } from 'axios';
import { IEngineAction } from '../../base/iEngineAction';

class GetFirstImageOfDatasetEngineAction implements IEngineAction {
	actionName: string;
	engineRequest: AxiosInstance;
	apiName: string;

	constructor(engineRequest: AxiosInstance) {
		this.engineRequest = engineRequest;
		this.actionName = 'Get First Image of Dataset';
		this.apiName = '/dataset/first-image';
	}

	run = async (config?: AxiosRequestConfig, data?: string) => {
		try {
			const res = await this.engineRequest.get(`${this.apiName}/${data}`, config);
			return [false, res.data];
		} catch (_err) {
			const err = _err as AxiosError;
			return [true, err.response?.data];
		}
	};
}

export { GetFirstImageOfDatasetEngineAction };
