import { AxiosError, AxiosInstance, AxiosRequestConfig } from 'axios';
import { IEngineRequest } from '../../base/iEngineRequest';

class UploadImageToDatasetEngineRequest implements IEngineRequest {
	actionName: string;
	engineRequest: AxiosInstance;
	apiName: string;
	constructor(engineRequest: AxiosInstance) {
		this.engineRequest = engineRequest;
		this.actionName = 'Upload Image to Dataset';
		this.apiName = '/dataset/';
	}

	run = async (config?: AxiosRequestConfig, data?: [string, string, object]) => {
		if (!data) return [false, { Error: 'Data cannot be undefined' }];

		try {
			const extendedAxiosConfig: AxiosRequestConfig = {
				...config,
				headers: {
					Authorization: `Bearer ${data[1]}`,
				},
			};
			const res = await this.engineRequest.post(
				`${this.apiName}/${data[0]}/inputs/upload`,
				data[2],
				extendedAxiosConfig,
			);
			return [false, res.data];
		} catch (_err) {
			const err = _err as AxiosError;
			return [true, err.response?.data];
		}
	};
}

export { UploadImageToDatasetEngineRequest };
