import { AxiosError, AxiosInstance, AxiosRequestConfig } from 'axios';
import { IEngineAction } from '../../base/iEngineAction';

/**
 * Data for getting a dataset label.
 */
export interface IGetDatasetLabelData {
	datasetID: string;
	labelValue: string;
}
class GetDatasetLabelEngineAction implements IEngineAction {
	actionName: string;
	engineRequest: AxiosInstance;
	apiName: string;

	constructor(engineRequest: AxiosInstance) {
		this.engineRequest = engineRequest;
		this.actionName = 'Get Dataset Label';
		this.apiName = '/dataset';
	}

	run = async (config?: AxiosRequestConfig, data?: IGetDatasetLabelData) => {
		try {
			const res = await this.engineRequest.get(
				`${this.apiName}/${data?.datasetID}/label/${data?.labelValue}`,
				config,
			);
			return [false, res.data];
		} catch (_err) {
			const err = _err as AxiosError;
			return [true, err.response?.data];
		}
	};
}

export { GetDatasetLabelEngineAction };
