import { AxiosError, AxiosInstance, AxiosRequestConfig } from 'axios';
import { EngineRequestError, Model } from '_/renderer/view/helpers/constants/engineTypes';
import { IEngineRequest } from '../../base/iEngineRequest';

/**
 * Data added to request when renaming a dataset.
 */
export interface IRenameDatasetData {
	new_dataset_name: string;
}

class RenameDatasetEngineRequest implements IEngineRequest {
	actionName: string;
	engineRequest: AxiosInstance;
	apiName: string;

	constructor(engineRequest: AxiosInstance) {
		this.engineRequest = engineRequest;
		this.actionName = 'Rename Dataset';
		this.apiName = '/dataset';
	}

	run = async (
		config?: AxiosRequestConfig,
		data?: [string, string, IRenameDatasetData],
	): Promise<[false, Model] | [true, EngineRequestError]> => {
		if (!data) return [true, { Error: 'Data cannot be undefined' }];

		try {
			const extendedAxiosConfig: AxiosRequestConfig = {
				...config,
				headers: {
					Authorization: `Bearer ${data[1]}`,
				},
			};

			const res = await this.engineRequest.patch(
				`${this.apiName}/${data[0]}/rename`,
				data[2],
				extendedAxiosConfig,
			);
			return [false, res.data];
		} catch (_err) {
			const err = _err as AxiosError;
			return [true, err.response?.data];
		}
	};
}

export { RenameDatasetEngineRequest };
