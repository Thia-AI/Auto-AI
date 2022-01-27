import { AxiosError, AxiosInstance, AxiosRequestConfig } from 'axios';
import { IEngineAction } from '../../base/iEngineAction';

/**
 * Data for adding a label.
 */
export interface UpdateInputLabelData {
	previous_label: string;
	new_label: string;
}
class UpdateInputLabelEngineAction implements IEngineAction {
	actionName: string;
	engineRequest: AxiosInstance;
	apiName: string;
	constructor(engineRequest: AxiosInstance) {
		this.engineRequest = engineRequest;
		this.actionName = 'Update Input Label';
		this.apiName = '/input/';
	}

	run = async (config?: AxiosRequestConfig, data?: [string, UpdateInputLabelData]) => {
		if (!data) return [false, { Error: 'Data cannot be undefined' }];

		try {
			const res = await this.engineRequest.put(`${this.apiName}/${data[0]}/update_label`, data[1], config);
			return [false, res.data];
		} catch (_err) {
			const err = _err as AxiosError;
			return [true, err.response?.data];
		}
	};
}

export { UpdateInputLabelEngineAction };
