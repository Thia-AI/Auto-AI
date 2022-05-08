import { AxiosError, AxiosInstance, AxiosRequestConfig } from 'axios';
import { IEngineRequest } from '../../base/iEngineRequest';

/**
 * Data for getting next cursor page.
 */
export interface IGetNextPageData {
	datasetID: string;
	data: {
		current_cursor_date: string;
	};
}
class GetNextPageEngineRequest implements IEngineRequest {
	actionName: string;
	engineRequest: AxiosInstance;
	apiName: string;

	constructor(engineRequest: AxiosInstance) {
		this.engineRequest = engineRequest;
		this.actionName = 'Get Next Page';
		this.apiName = '/dataset';
	}

	run = async (config?: AxiosRequestConfig, data?: IGetNextPageData) => {
		try {
			const res = await this.engineRequest.post(
				`${this.apiName}/${data?.datasetID}/inputs/cursor/next`,
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

export { GetNextPageEngineRequest };
