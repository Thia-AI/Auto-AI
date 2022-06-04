import { AxiosError, AxiosInstance, AxiosRequestConfig } from 'axios';
import { PossibleModelExportTypes } from '_/renderer/view/helpers/constants/engineTypes';
import { IEngineRequest } from '../../base/iEngineRequest';

/**
 * Data for exporting a model.
 */
export interface IExportModelData {
	export_type: PossibleModelExportTypes;
	save_dir: string;
}

class ExportModelEngineRequest implements IEngineRequest {
	actionName: string;
	engineRequest: AxiosInstance;
	apiName: string;
	constructor(engineRequest: AxiosInstance) {
		this.engineRequest = engineRequest;
		this.actionName = 'Export Model';
		this.apiName = '/model';
	}

	run = async (config?: AxiosRequestConfig, data?: [string, IExportModelData]) => {
		if (!data) return [false, { Error: 'Data cannot be undefined' }];

		try {
			const res = await this.engineRequest.post(`${this.apiName}/${data[0]}/export`, data[1], config);
			return [false, res.data];
		} catch (_err) {
			const err = _err as AxiosError;
			return [true, err.response?.data];
		}
	};
}

export { ExportModelEngineRequest };
