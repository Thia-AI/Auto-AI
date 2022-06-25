import { AxiosError, AxiosInstance, AxiosRequestConfig } from 'axios';
import { IEngineRequest } from '../../base/iEngineRequest';

/**
 * Data for deleting a label.
 */
export interface IDeleteLabelData {
	label: string;
}
class DeleteLabelEngineRequest implements IEngineRequest {
	actionName: string;
	engineRequest: AxiosInstance;
	apiName: string;
	constructor(engineRequest: AxiosInstance) {
		this.engineRequest = engineRequest;
		this.actionName = 'Delete Label';
		this.apiName = '/dataset/';
	}

	run = async (config?: AxiosRequestConfig, data?: [string, string, IDeleteLabelData]) => {
		if (!data) return [false, { Error: 'Data cannot be undefined' }];

		try {
			const extendedAxiosConfig: AxiosRequestConfig = {
				...config,
				headers: {
					Authorization: `Bearer ${data[1]}`,
				},
			};
			const res = await this.engineRequest.delete(`${this.apiName}/${data[0]}/labels/remove`, {
				...extendedAxiosConfig,
				data: data[2],
			});
			return [false, res.data];
		} catch (_err) {
			const err = _err as AxiosError;
			return [true, err.response?.data];
		}
	};
}

export { DeleteLabelEngineRequest };
