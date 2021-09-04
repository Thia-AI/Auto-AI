import { AxiosError, AxiosInstance, AxiosRequestConfig } from 'axios';
import { IEngineAction } from '../../base/iEngineAction';

class DeleteLabelEngineAction implements IEngineAction {
	actionName: string;
	engineRequest: AxiosInstance;
	apiName: string;
	constructor(engineRequest: AxiosInstance) {
		this.engineRequest = engineRequest;
		this.actionName = 'Delete Label';
		this.apiName = '/dataset/';
	}

	run = async (config?: AxiosRequestConfig, data?: [string, object]) => {
		if (!data) return [false, { Error: 'Data cannot be undefined' }];

		try {
			const res = await this.engineRequest.delete(
				`${this.apiName}/${data[0]}/labels/remove`,
				{
					...config,
					data: data[1],
				},
			);
			return [false, res.data];
		} catch (_err) {
			const err = _err as AxiosError;
			return [true, err.response?.data];
		}
	};
}

export { DeleteLabelEngineAction };
