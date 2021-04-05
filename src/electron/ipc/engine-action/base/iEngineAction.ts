import { AxiosInstance } from 'axios';

interface IEngineAction {
	engineRequest: AxiosInstance;
	actionName: string;
	run(): Promise<any>;
}

export { IEngineAction };
