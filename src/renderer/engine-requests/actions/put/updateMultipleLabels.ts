import { AxiosError, AxiosInstance, AxiosRequestConfig } from 'axios';
import { IEngineRequest } from '../../base/iEngineRequest';

/**
 * Batch labelling engine request.
 */
export class UpdateMultipleLabelsEngineRequest implements IEngineRequest {
	actionName: string;
	engineRequest: AxiosInstance;
	apiName: string;
	constructor(engineRequest: AxiosInstance) {
		this.engineRequest = engineRequest;
		this.actionName = 'Update Multiple Labels';
		this.apiName = '/dataset';
	}

	run = async (config?: AxiosRequestConfig, data?: [string, FormData]) => {
		if (!data) return [true, { Error: 'Data cannot be undefined' }];
		try {
			const res = await this.engineRequest.put(
				`${this.apiName}/${data[0]}/inputs/update-labels-many`,
				data[1],
				config,
			);
			return [false, res.data];
		} catch (_err) {
			const err = _err as AxiosError;
			return [true, err.response?.data];
		}
	};
}
