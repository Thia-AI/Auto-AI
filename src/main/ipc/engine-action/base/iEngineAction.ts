import { AxiosInstance, AxiosRequestConfig } from 'axios';

/**
 * Interface representing an EngineAction
 */
interface IEngineAction {
	engineRequest: AxiosInstance;
	actionName: string;
	readonly apiName: string;
	run(config?: AxiosRequestConfig): Promise<any>; // eslint-disable-line @typescript-eslint/no-explicit-any
}

export { IEngineAction };
