import { AxiosError, AxiosInstance, AxiosRequestConfig } from 'axios';
import { IEngineAction } from '../../base/iEngineAction';

class GetActiveModelExportsEngineAction implements IEngineAction {
	actionName: string;
	engineRequest: AxiosInstance;
	apiName: string;

	constructor(engineRequest: AxiosInstance) {
		this.engineRequest = engineRequest;
		this.actionName = 'Get Active Model Exports';
		this.apiName = '/model';
	}

	run = async (config?: AxiosRequestConfig, data?: string): Promise<[boolean, any]> => {
		try {
			const res = await this.engineRequest.get(`${this.apiName}/${data}/active_exports`, config);
			return [false, res.data];
		} catch (_err) {
			const err = _err as AxiosError;
			return [true, err.response?.data];
		}
	};
}

export { GetActiveModelExportsEngineAction };
