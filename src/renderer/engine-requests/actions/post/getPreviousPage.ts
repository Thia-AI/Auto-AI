import { AxiosError, AxiosInstance, AxiosRequestConfig } from 'axios';
import { IEngineRequest } from '../../base/iEngineRequest';

/**
 * Data for getting previous cursor page.
 */
export interface IGetPreviousPageData {
	datasetID: string;
	data: {
		current_cursor_date: string;
	};
}
class GetPreviousPageEngineRequest implements IEngineRequest {
	actionName: string;
	engineRequest: AxiosInstance;
	apiName: string;

	constructor(engineRequest: AxiosInstance) {
		this.engineRequest = engineRequest;
		this.actionName = 'Get Previous Page';
		this.apiName = '/dataset';
	}

	run = async (config?: AxiosRequestConfig, data?: IGetPreviousPageData) => {
		try {
			const res = await this.engineRequest.post(
				`${this.apiName}/${data?.datasetID}/inputs/cursor/previous`,
				data?.data,
				config,
			);
			return [false, res.data];
		} catch (_err) {
			const err = _err as AxiosError;
			return [true, err.response?.data];
		}
	};
}

export { GetPreviousPageEngineRequest };
