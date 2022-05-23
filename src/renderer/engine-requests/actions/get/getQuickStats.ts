import { AxiosError, AxiosInstance, AxiosRequestConfig } from 'axios';
import { IEngineRequest } from '../../base/iEngineRequest';

/**
 * Response for Quick Stats Engine Request.
 */
export interface IGetQuickStatsERResponse {
	num_models: number;
	num_exports: number;
	num_datasets: number;
	num_images: number;
	num_labels: number;
}
class GetQuickStatsEngineRequest implements IEngineRequest {
	actionName: string;
	engineRequest: AxiosInstance;
	apiName: string;

	constructor(engineRequest: AxiosInstance) {
		this.engineRequest = engineRequest;
		this.actionName = 'Get Quick Stats';
		this.apiName = '/telemetry/quick_stats';
	}

	run = async (config?: AxiosRequestConfig): Promise<[boolean, IGetQuickStatsERResponse]> => {
		try {
			const res = await this.engineRequest.get(`${this.apiName}`, config);
			return [false, res.data];
		} catch (_err) {
			const err = _err as AxiosError;
			return [true, err.response?.data];
		}
	};
}

export { GetQuickStatsEngineRequest };
