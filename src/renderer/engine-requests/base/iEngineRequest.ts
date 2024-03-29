import { AxiosInstance, AxiosRequestConfig } from 'axios';

/**
 * Interface representing an EngineAction
 */

interface IEngineRequest {
	engineRequest: AxiosInstance;
	actionName: string;
	readonly apiName: string;
	run(config?: AxiosRequestConfig, data?: any): Promise<any>; // eslint-disable-line @typescript-eslint/no-explicit-any
}

export { IEngineRequest };
