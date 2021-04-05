import { AxiosInstance, AxiosResponse, AxiosError } from 'axios';
import { IEngineAction } from '../base/iEngineAction';

class GetDevicesEngineAction implements IEngineAction {
	actionName: string;
	engineRequest: AxiosInstance;
	constructor(engineRequest: AxiosInstance) {
		this.engineRequest = engineRequest;
		this.actionName = '';
	}
	async run(): Promise<Array<object>> {
		try {
			const res = await this.engineRequest.get('/getDevices');
			return res.data;
		} catch (err) {
			// return ErrorHandler(error);
			console.log(err);
			return [{ error: 'SERVER-ERROR' }];
		}
	}
}

export { GetDevicesEngineAction };
