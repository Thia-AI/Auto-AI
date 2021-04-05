import { AxiosInstance } from 'axios';

interface IEngineAction {
	engineRequest: AxiosInstance;
	actionName: string;
	run(): Promise<Array<any>>;
}

export { IEngineAction };
