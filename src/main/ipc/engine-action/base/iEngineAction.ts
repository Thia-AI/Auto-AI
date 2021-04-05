import { AxiosInstance } from 'axios';

interface IEngineAction {
	engineRequest: AxiosInstance;
	actionName: string;
	readonly apiName: string;
	run(): Promise<any>;
}

export { IEngineAction };
