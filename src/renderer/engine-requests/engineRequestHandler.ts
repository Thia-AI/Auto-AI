import { AxiosInstance, AxiosRequestConfig } from 'axios';
import { DeleteAllInputsFromDatasetEngineRequest } from './actions/delete/deleteAllInputsFromDataset';
import { DeleteDatasetEngineRequest } from './actions/delete/deleteDataset';
import { DeleteLabelEngineRequest, IDeleteLabelData } from './actions/delete/deleteLabel';
import { GetDatasetEngineRequest } from './actions/get/getDataset';
import { GetDatasetByNameEngineRequest } from './actions/get/getDatasetByName';
import { GetDatasetsEngineRequest } from './actions/get/getDatasets';
import { GetDevicesEngineRequest } from './actions/get/getDevices';
import { GetJobEngineRequest } from './actions/get/getJob';
import { GetModelEngineRequest } from './actions/get/getModel';
import { GetModelsEngineRequest } from './actions/get/getModels';
import { GetNextPageEngineRequest, IGetNextPageData } from './actions/post/getNextPage';
import { GetPreviousPageEngineRequest, IGetPreviousPageData } from './actions/post/getPreviousPage';
import { UpdateLabelsOrderEngineRequest } from './actions/patch/updateLabelsOrder';
import { AddLabelEngineRequest, IAddLabelData } from './actions/post/addLabel';
import { CreateDatasetEngineRequest } from './actions/post/createDataset';
import { CreateModelData, CreateModelEngineRequest } from './actions/post/createModel';
import { UploadImageToDatasetEngineRequest } from './actions/post/uploadImageToDataset';
import { GetDatasetLabelsEngineRequest } from './actions/get/getDatasetLabels';
import { GetDatasetLabelEngineRequest, IGetDatasetLabelData } from './actions/get/getDatasetLabel';
import { UpdateInputLabelData, UpdateInputLabelEngineRequest } from './actions/put/updateInputLabel';
import { ITrainModelData, TrainModelEngineRequest } from './actions/post/trainModel';
import { GetTrainJobEngineRequest } from './actions/get/getTrainJobs';
import { TestModelEngineRequest } from './actions/post/testModel';
import { GetTelemetryGPUStateEngineRequest } from './actions/get/getTelemetryGPUState';
import { CancelJobEngineRequest } from './actions/delete/cancelJob';
import { ExportModelEngineRequest, IExportModelData } from './actions/post/exportModel';
import { GetActiveModelExportsEngineRequest } from './actions/get/getActiveModelExports';
import { DeleteModelEngineRequest } from './actions/delete/deleteModel';
import { GetQuickStatsEngineRequest } from './actions/get/getQuickStats';
import { DownloadLabelsCSVEngineRequest } from './actions/get/downloadLabelsCsv';
import { UpdateMultipleLabelsEngineRequest } from './actions/put/updateMultipleLabels';
import { DeleteInputEngineRequest } from './actions/delete/deleteInput';
import { GetModelsCacheEngineRequest } from './actions/get/getModelsCache';
import { DeleteModelCacheEngineRequest } from './actions/delete/deleteModelCache';
import { DeleteEntireModelCacheEngineRequest } from './actions/delete/deleteEntireModelCache';
import { IRenameModelData, RenameModelEngineRequest } from './actions/patch/renameModel';
import { IRenameDatasetData, RenameDatasetEngineRequest } from './actions/patch/renameDataset';

/**
 * Class that manages all Engine Requests.
 */
export class EngineRequestHandler {
	private static instance: EngineRequestHandler;
	private engineRequest!: AxiosInstance;

	// Engine status
	private getDevicesER!: GetDevicesEngineRequest;
	// Jobs
	private getJobER!: GetJobEngineRequest;
	private getTrainJobER!: GetTrainJobEngineRequest;
	private cancelJobER!: CancelJobEngineRequest;
	// Models
	private createModelER!: CreateModelEngineRequest;
	private getModelsER!: GetModelsEngineRequest;
	private getModelER!: GetModelEngineRequest;
	private trainModelER!: TrainModelEngineRequest;
	private testModelER!: TestModelEngineRequest;
	private exportModelER!: ExportModelEngineRequest;
	private getActiveModelExportsER!: GetActiveModelExportsEngineRequest;
	private deleteModelER!: DeleteModelEngineRequest;
	private renameModelER!: RenameModelEngineRequest;
	// Datasets
	private createDatasetER!: CreateDatasetEngineRequest;
	private getDatasetsER!: GetDatasetsEngineRequest;
	private getDatasetER!: GetDatasetEngineRequest;
	private getDatasetByNameER!: GetDatasetByNameEngineRequest;
	private getPreviousPageER!: GetPreviousPageEngineRequest;
	private getNextPageER!: GetNextPageEngineRequest;
	private deleteDatasetER!: DeleteDatasetEngineRequest;
	private deleteAllInputsFromDatasetER!: DeleteAllInputsFromDatasetEngineRequest;
	private uploadImagetoDatasetER!: UploadImageToDatasetEngineRequest;
	private deleteInputER!: DeleteInputEngineRequest;
	private renameDatasetER!: RenameDatasetEngineRequest;
	// Dataset Labels
	private addLabelToDatasetER!: AddLabelEngineRequest;
	private deleteLabelFromDatasetER!: DeleteLabelEngineRequest;
	private updateLabelsOrderER!: UpdateLabelsOrderEngineRequest;
	private getDatasetLabelsER!: GetDatasetLabelsEngineRequest;
	private getDatasetLabelER!: GetDatasetLabelEngineRequest;
	private updateInputLabelER!: UpdateInputLabelEngineRequest;
	private downloadLabelsER!: DownloadLabelsCSVEngineRequest;
	private updateMultipleLabelsER!: UpdateMultipleLabelsEngineRequest;
	// Telemetry
	private getGPUStateER!: GetTelemetryGPUStateEngineRequest;
	private getQuickStatsER!: GetQuickStatsEngineRequest;
	// Model Cache
	private getModelsCacheER!: GetModelsCacheEngineRequest;
	private deleteModelCacheER!: DeleteModelCacheEngineRequest;
	private deleteEntireModelCacheER!: DeleteEntireModelCacheEngineRequest;

	/**
	 * Private constructor.
	 */
	private constructor() {}

	/**
	 * Gives you the EngineActionHandler instance from anywhere in **App** with
	 * `EngineActionHandler.getInstance();`.
	 *
	 * @returns Singleton EngineActionHandler instance.
	 */
	public static getInstance(): EngineRequestHandler {
		if (!EngineRequestHandler.instance) {
			EngineRequestHandler.instance = new EngineRequestHandler();
		}

		return EngineRequestHandler.instance;
	}

	/**
	 * Initializes EngineActionHandler.
	 *
	 * @param eR EngineRequest instance to set as the AxiosInstance to use for EngineActions.
	 */
	public initInstances = (eR: AxiosInstance) => {
		this.engineRequest = eR;
		// Engine status
		this.getDevicesER = new GetDevicesEngineRequest(this.engineRequest);
		// Jobs
		this.getJobER = new GetJobEngineRequest(this.engineRequest);
		this.getTrainJobER = new GetTrainJobEngineRequest(this.engineRequest);
		this.cancelJobER = new CancelJobEngineRequest(this.engineRequest);
		// Models
		this.createModelER = new CreateModelEngineRequest(this.engineRequest);
		this.getModelsER = new GetModelsEngineRequest(this.engineRequest);
		this.getModelER = new GetModelEngineRequest(this.engineRequest);
		this.trainModelER = new TrainModelEngineRequest(this.engineRequest);
		this.testModelER = new TestModelEngineRequest(this.engineRequest);
		this.exportModelER = new ExportModelEngineRequest(this.engineRequest);
		this.getActiveModelExportsER = new GetActiveModelExportsEngineRequest(this.engineRequest);
		this.deleteModelER = new DeleteModelEngineRequest(this.engineRequest);
		this.renameModelER = new RenameModelEngineRequest(this.engineRequest);
		// Datasets
		this.createDatasetER = new CreateDatasetEngineRequest(this.engineRequest);
		this.getDatasetsER = new GetDatasetsEngineRequest(this.engineRequest);
		this.getDatasetER = new GetDatasetEngineRequest(this.engineRequest);
		this.getDatasetByNameER = new GetDatasetByNameEngineRequest(this.engineRequest);
		this.getPreviousPageER = new GetPreviousPageEngineRequest(this.engineRequest);
		this.getNextPageER = new GetNextPageEngineRequest(this.engineRequest);
		this.deleteDatasetER = new DeleteDatasetEngineRequest(this.engineRequest);
		this.uploadImagetoDatasetER = new UploadImageToDatasetEngineRequest(this.engineRequest);
		this.deleteAllInputsFromDatasetER = new DeleteAllInputsFromDatasetEngineRequest(this.engineRequest);
		this.renameDatasetER = new RenameDatasetEngineRequest(this.engineRequest);
		// Dataset Labels
		this.addLabelToDatasetER = new AddLabelEngineRequest(this.engineRequest);
		this.updateLabelsOrderER = new UpdateLabelsOrderEngineRequest(this.engineRequest);
		this.deleteLabelFromDatasetER = new DeleteLabelEngineRequest(this.engineRequest);
		this.getDatasetLabelsER = new GetDatasetLabelsEngineRequest(this.engineRequest);
		this.getDatasetLabelER = new GetDatasetLabelEngineRequest(this.engineRequest);
		this.updateInputLabelER = new UpdateInputLabelEngineRequest(this.engineRequest);
		this.downloadLabelsER = new DownloadLabelsCSVEngineRequest(this.engineRequest);
		this.updateMultipleLabelsER = new UpdateMultipleLabelsEngineRequest(this.engineRequest);
		this.deleteInputER = new DeleteInputEngineRequest(this.engineRequest);
		// Telemetry
		this.getGPUStateER = new GetTelemetryGPUStateEngineRequest(this.engineRequest);
		this.getQuickStatsER = new GetQuickStatsEngineRequest(this.engineRequest);
		// Model Cache
		this.getModelsCacheER = new GetModelsCacheEngineRequest(this.engineRequest);
		this.deleteModelCacheER = new DeleteModelCacheEngineRequest(this.engineRequest);
		this.deleteEntireModelCacheER = new DeleteEntireModelCacheEngineRequest(this.engineRequest);
	};

	/**
	 * Calls GetDevicesEngineAction's `run()` method.
	 *
	 * @param config Configuration to use for running `/devices` EngineAction.
	 * @returns Data returned by GetDevicesEngineAction.
	 */
	public getDevices = async (config?: AxiosRequestConfig) => {
		return this.getDevicesER.run(config);
	};

	public getJob = async (uuid: string, config?: AxiosRequestConfig) => {
		return this.getJobER.run(config, uuid);
	};

	public getTrainJob = async (trainJobID: string, config?: AxiosRequestConfig) => {
		return this.getTrainJobER.run(config, trainJobID);
	};

	public cancelJob = async (jobID: string, config?: AxiosRequestConfig) => {
		return this.cancelJobER.run(config, jobID);
	};

	public createModel = async (data: CreateModelData, idToken: string, config?: AxiosRequestConfig) => {
		return this.createModelER.run(config, [idToken, data]);
	};

	public deleteModel = async (modelID: string, idToken: string, config?: AxiosRequestConfig) => {
		return this.deleteModelER.run(config, [modelID, idToken]);
	};

	public getModels = async (config?: AxiosRequestConfig) => {
		return this.getModelsER.run(config);
	};

	public getModel = async (uuid: string, idToken: string, config?: AxiosRequestConfig) => {
		return this.getModelER.run(config, [idToken, uuid]);
	};

	public createDataset = async (data: object, idToken: string, config?: AxiosRequestConfig) => {
		return this.createDatasetER.run(config, [idToken, data]);
	};

	public getDatasets = async (config?: AxiosRequestConfig) => {
		return this.getDatasetsER.run(config);
	};

	public getDataset = async (uuid: string, config?: AxiosRequestConfig) => {
		return this.getDatasetER.run(config, uuid);
	};

	public getDatasetByName = async (name: string, config?: AxiosRequestConfig) => {
		return this.getDatasetByNameER.run(config, name);
	};

	public getPreviousPage = async (uuid: string, currentCursorDate: string, config?: AxiosRequestConfig) => {
		const data: IGetPreviousPageData = {
			datasetID: uuid,
			data: {
				current_cursor_date: currentCursorDate,
			},
		};

		return this.getPreviousPageER.run(config, data);
	};

	public getNextPage = async (uuid: string, currentCursorDate: string, config?: AxiosRequestConfig) => {
		const data: IGetNextPageData = {
			datasetID: uuid,
			data: {
				current_cursor_date: currentCursorDate,
			},
		};

		return this.getNextPageER.run(config, data);
	};

	public deleteDataset = async (uuid: string, idToken: string, config?: AxiosRequestConfig) => {
		return this.deleteDatasetER.run(config, [uuid, idToken]);
	};

	public deleteAllInputsFromDataset = (uuid: string, config?: AxiosRequestConfig) => {
		return this.deleteAllInputsFromDatasetER.run(config, uuid);
	};

	public uploadImagesToDataset = async (
		uuid: string,
		idToken: string,
		jsonData: object,
		config?: AxiosRequestConfig,
	) => {
		return this.uploadImagetoDatasetER.run(config, [uuid, idToken, jsonData]);
	};

	public addLabelToDataset = async (
		uuid: string,
		idToken: string,
		jsonData: IAddLabelData,
		config?: AxiosRequestConfig,
	) => {
		return this.addLabelToDatasetER.run(config, [uuid, idToken, jsonData]);
	};

	public deleteLabelFromDataset = async (
		uuid: string,
		idToken: string,
		jsonData: IDeleteLabelData,
		config?: AxiosRequestConfig,
	) => {
		return this.deleteLabelFromDatasetER.run(config, [uuid, idToken, jsonData]);
	};

	public getDatasetLabels = async (uuid: string, config?: AxiosRequestConfig) => {
		return this.getDatasetLabelsER.run(config, uuid);
	};

	public getDatasetLabel = async (datasetID: string, labelValue: string, config?: AxiosRequestConfig) => {
		const data: IGetDatasetLabelData = {
			datasetID,
			labelValue,
		};
		return this.getDatasetLabelER.run(config, data);
	};

	public updateLabelsOrder = async (uuid: string, jsonData: object, config?: AxiosRequestConfig) => {
		return this.updateLabelsOrderER.run(config, [uuid, jsonData]);
	};

	public updateInputLabel = async (inputID: string, data: UpdateInputLabelData, config?: AxiosRequestConfig) => {
		return this.updateInputLabelER.run(config, [inputID, data]);
	};

	public trainModel = async (
		modelID: string,
		idToken: string,
		data: ITrainModelData,
		config?: AxiosRequestConfig,
	) => {
		return this.trainModelER.run(config, [modelID, idToken, data]);
	};

	public testModel = async (modelID: string, idToken: string, data: FormData, config?: AxiosRequestConfig) => {
		return this.testModelER.run(config, [modelID, idToken, data]);
	};

	public getTelemeteryGPUState = async (config?: AxiosRequestConfig) => {
		return this.getGPUStateER.run(config);
	};

	public getQuickStats = async (config?: AxiosRequestConfig) => {
		return this.getQuickStatsER.run(config);
	};

	public exportModel = async (
		modelID: string,
		idToken: string,
		data: IExportModelData,
		config?: AxiosRequestConfig,
	) => {
		return this.exportModelER.run(config, [modelID, idToken, data]);
	};

	public getActiveModelExports = async (modelID: string, config?: AxiosRequestConfig) => {
		return this.getActiveModelExportsER.run(config, modelID);
	};

	public downloadLabelsCSV = async (modelID: string, config?: AxiosRequestConfig) => {
		return this.downloadLabelsER.run(config, modelID);
	};

	public updateMultipleLabels = async (datasetID: string, formData: FormData, config?: AxiosRequestConfig) => {
		return this.updateMultipleLabelsER.run(config, [datasetID, formData]);
	};

	public deleteInput = async (idToken: string, datasetID: string, inputID: string, config?: AxiosRequestConfig) => {
		return this.deleteInputER.run(config, [idToken, datasetID, inputID]);
	};

	public getModelsCache = async (config?: AxiosRequestConfig) => {
		return this.getModelsCacheER.run(config);
	};

	public deleteModelCache = async (modelType: string, config?: AxiosRequestConfig) => {
		return this.deleteModelCacheER.run(config, modelType);
	};

	public deleteEntireModelCache = async (config?: AxiosRequestConfig) => {
		return this.deleteEntireModelCacheER.run(config);
	};

	public renameModel = async (
		modelID: string,
		idToken: string,
		renameModelData: IRenameModelData,
		config?: AxiosRequestConfig,
	) => {
		return this.renameModelER.run(config, [modelID, idToken, renameModelData]);
	};

	public renameDataset = async (
		datasetID: string,
		idToken: string,
		renameDatasetData: IRenameDatasetData,
		config?: AxiosRequestConfig,
	) => {
		return this.renameDatasetER.run(config, [datasetID, idToken, renameDatasetData]);
	};
}
