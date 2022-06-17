import { AxiosError, AxiosInstance, AxiosRequestConfig } from 'axios';
import { ipcRenderer } from 'electron';
import { IPC_ENGINE_SAVE_LABELS_CSV } from '_/shared/ipcChannels';
import { IEngineRequest } from '../../base/iEngineRequest';

class DownloadLabelsCSVEngineRequest implements IEngineRequest {
	actionName: string;
	engineRequest: AxiosInstance;
	apiName: string;

	constructor(engineRequest: AxiosInstance) {
		this.engineRequest = engineRequest;
		this.actionName = 'Download Labels CSV';
		this.apiName = '/model';
	}

	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	run = async (config?: AxiosRequestConfig, data?: string): Promise<[boolean, object] | void> => {
		try {
			const res = await this.engineRequest.get(`${this.apiName}/${data}/labels-csv`, config);
			const fileNameHeader = 'x-suggested-filename';
			const suggestedFileName = res.headers[fileNameHeader];
			const effectiveFileName = suggestedFileName === undefined ? 'labels_to_class.csv' : suggestedFileName;
			console.log(effectiveFileName, res.data);
			await ipcRenderer.invoke(IPC_ENGINE_SAVE_LABELS_CSV, effectiveFileName, res.data);
		} catch (_err) {
			const err = _err as AxiosError;
			return [true, err.response?.data];
		}
	};
}

export { DownloadLabelsCSVEngineRequest };
