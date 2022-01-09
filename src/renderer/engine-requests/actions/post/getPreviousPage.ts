import { AxiosError, AxiosInstance, AxiosRequestConfig } from 'axios';
import { IEngineAction } from '../../base/iEngineAction';

/**
 * Data for getting previous cursor page.
 */
export interface IGetPreviousPageData {
	datasetID: string;
	data: {
		current_cursor_date: string;
	};
}
class GetPreviousPageEngineAction implements IEngineAction {
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
			const res = await this.engineRequest.get(
				`${this.apiName}/${data?.datasetID}/inputs/cursor/previous`,
				{
					...config,
					data: data?.data,
				},
			);
			return [false, res.data];
		} catch (_err) {
			const err = _err as AxiosError;
			return [true, err.response?.data];
		}
	};
}

export { GetPreviousPageEngineAction };
