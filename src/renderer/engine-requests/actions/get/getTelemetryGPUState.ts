import { AxiosError, AxiosInstance, AxiosRequestConfig } from 'axios';
import { IEngineAction } from '../../base/iEngineAction';

class GetTelemetryGPUStateEngineAction implements IEngineAction {
	actionName: string;
	engineRequest: AxiosInstance;
	apiName: string;

	constructor(engineRequest: AxiosInstance) {
		this.engineRequest = engineRequest;
		this.actionName = 'Get Telemetry GPU State';
		this.apiName = '/telemetry/gpu_state';
	}

	run = async (config?: AxiosRequestConfig) => {
		try {
			const res = await this.engineRequest.get(`${this.apiName}`, config);
			return [false, res.data];
		} catch (_err) {
			const err = _err as AxiosError;
			return [true, err.response?.data];
		}
	};
}

export { GetTelemetryGPUStateEngineAction };
