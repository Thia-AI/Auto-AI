import { AxiosInstance, AxiosRequestConfig } from 'axios';

interface IEngineAction {
	engineRequest: AxiosInstance;
	actionName: string;
	readonly apiName: string;
	run(config?: AxiosRequestConfig): Promise<any>;
}

export { IEngineAction };
