import { AxiosError, AxiosInstance, AxiosRequestConfig } from 'axios';
import { IEngineRequest } from '../../base/iEngineRequest';

/**
 * Data for adding a label.
 */
export interface IAddLabelData {
	label: string;
	color: string;
}
class AddLabelEngineRequest implements IEngineRequest {
	actionName: string;
	engineRequest: AxiosInstance;
	apiName: string;
	constructor(engineRequest: AxiosInstance) {
		this.engineRequest = engineRequest;
		this.actionName = 'Add Label';
		this.apiName = '/dataset';
	}

	run = async (config?: AxiosRequestConfig, data?: [string, string, IAddLabelData]) => {
		if (!data) return [false, { Error: 'Data cannot be undefined' }];

		try {
			const extendedAxiosConfig: AxiosRequestConfig = {
				...config,
				headers: {
					Authorization: `Bearer ${data[1]}`,
				},
			};
			const res = await this.engineRequest.post(
				`${this.apiName}/${data[0]}/labels/add`,
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

export { AddLabelEngineRequest };
