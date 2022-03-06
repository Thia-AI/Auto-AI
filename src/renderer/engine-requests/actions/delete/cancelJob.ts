import { AxiosError, AxiosInstance, AxiosRequestConfig } from 'axios';
import { IEngineAction } from '../../base/iEngineAction';

class CancelJobEngineAction implements IEngineAction {
	actionName: string;
	engineRequest: AxiosInstance;
	apiName: string;

	constructor(engineRequest: AxiosInstance) {
		this.engineRequest = engineRequest;
		this.actionName = 'Cancel Job';
		this.apiName = '/job';
	}

	run = async (config?: AxiosRequestConfig, data?: string) => {
		try {
			const res = await this.engineRequest.delete(`${this.apiName}/${data}/cancel`, config);
			return [false, res.data];
		} catch (_err) {
			const err = _err as AxiosError;
			return [true, err.response?.data];
		}
	};
}

export { CancelJobEngineAction as CancelJobEA };
