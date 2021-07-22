import { AxiosError, AxiosInstance, AxiosRequestConfig } from 'axios';
import { IEngineAction } from '../../base/iEngineAction';

class UploadImageToDatasetEngineAction implements IEngineAction {
	actionName: string;
	engineRequest: AxiosInstance;
	apiName: string;
	constructor(engineRequest: AxiosInstance) {
		this.engineRequest = engineRequest;
		this.actionName = 'Upload Image to Dataset';
		this.apiName = '/dataset/';
	}

	run = async (config?: AxiosRequestConfig, data?: [string, object]) => {
		try {
			if (!data) return [false, { Error: 'Data cannot be undefined' }];

			const res = await this.engineRequest.post(
				`${this.apiName}/${data[0]}/input/upload`,
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

export { UploadImageToDatasetEngineAction };
