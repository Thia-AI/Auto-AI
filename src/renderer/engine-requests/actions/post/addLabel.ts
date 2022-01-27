import { AxiosError, AxiosInstance, AxiosRequestConfig } from 'axios';
import { IEngineAction } from '../../base/iEngineAction';

/**
 * Data for adding a label.
 */
export interface IAddLabelData {
	label: string;
	color: string;
}
class AddLabelEngineAction implements IEngineAction {
	actionName: string;
	engineRequest: AxiosInstance;
	apiName: string;
	constructor(engineRequest: AxiosInstance) {
		this.engineRequest = engineRequest;
		this.actionName = 'Add Label';
		this.apiName = '/dataset/';
	}

	run = async (config?: AxiosRequestConfig, data?: [string, IAddLabelData]) => {
		if (!data) return [false, { Error: 'Data cannot be undefined' }];

		try {
			const res = await this.engineRequest.post(`${this.apiName}/${data[0]}/labels/add`, data[1], config);
			return [false, res.data];
		} catch (_err) {
			const err = _err as AxiosError;
			return [true, err.response?.data];
		}
	};
}

export { AddLabelEngineAction };
