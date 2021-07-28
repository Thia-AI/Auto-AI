import { AxiosInstance, AxiosRequestConfig } from 'axios';
import { DeleteDatasetEngineAction } from './actions/delete/deleteDataset';
import { GetDatasetEngineAction } from './actions/get/getDataset';
import { GetDatasetByNameEngineAction } from './actions/get/getDatasetByName';
import { GetDatasetsEngineAction } from './actions/get/getDatasets';
import { GetDevicesEngineAction } from './actions/get/getDevices';
import { GetFirstImageOfDatasetEngineAction } from './actions/get/getFirstImageOfDataset';
import { GetJobEngineAction } from './actions/get/getJob';
import { GetModelEngineAction } from './actions/get/getModel';
import { GetModelsEngineAction } from './actions/get/getModels';
import { CreateDatasetEngineAction } from './actions/post/createDataset';
import { CreateModelEngineAction } from './actions/post/createModel';
import { UploadImageToDatasetEngineAction } from './actions/post/uploadImageToDataset';

/**
 * Class that manages all EngineActions
 */
class EngineActionHandler {
	private static instance: EngineActionHandler;

	// Engine status
	private getDevicesEA!: GetDevicesEngineAction;
	// Jobs
	private getJobEA!: GetJobEngineAction;
	// Models
	private createModelEA!: CreateModelEngineAction;
	private getModelsEA!: GetModelsEngineAction;
	private getModelEA!: GetModelEngineAction;
	// Datasets
	private createDatasetEA!: CreateDatasetEngineAction;
	private getDatasetsEA!: GetDatasetsEngineAction;
	private getDatasetEA!: GetDatasetEngineAction;
	private getDatasetByNameEA!: GetDatasetByNameEngineAction;
	private getFirstImageOfDatasetEA!: GetFirstImageOfDatasetEngineAction;
	private deleteDatasetEA!: DeleteDatasetEngineAction;
	private uploadImagetoDatasetEA!: UploadImageToDatasetEngineAction;

	private _engineRequest!: AxiosInstance;

	/**
	 * Private constructor
	 */
	private constructor() {}

	/**
	 * Gives you the EngineActionHandler instance from anywhere in **App** with
	 * `EngineActionHandler.getInstance();`
	 * @returns singleton EngineActionHandler instance
	 */
	public static getInstance(): EngineActionHandler {
		if (!EngineActionHandler.instance) {
			EngineActionHandler.instance = new EngineActionHandler();
		}

		return EngineActionHandler.instance;
	}

	/**
	 * Getter for _engineRequest
	 */
	get engineRequest() {
		return this._engineRequest;
	}

	/**
	 * Setter for _engineRequest
	 */
	set engineRequest(eR: AxiosInstance) {
		this._engineRequest = eR;
	}

	/**
	 * Initializes EngineActionHandler
	 * @param eR engineRequest instance to set as the AxiosInstance to use for EngineActions
	 */
	public initInstances = (eR: AxiosInstance) => {
		this.engineRequest = eR;
		// Engine status
		this.getDevicesEA = new GetDevicesEngineAction(this._engineRequest);
		// Jobs
		this.getJobEA = new GetJobEngineAction(this._engineRequest);
		// Models
		this.createModelEA = new CreateModelEngineAction(this._engineRequest);
		this.getModelsEA = new GetModelsEngineAction(this._engineRequest);
		this.getModelEA = new GetModelEngineAction(this._engineRequest);
		// Datasets
		this.createDatasetEA = new CreateDatasetEngineAction(this._engineRequest);
		this.getDatasetsEA = new GetDatasetsEngineAction(this._engineRequest);
		this.getDatasetEA = new GetDatasetEngineAction(this._engineRequest);
		this.getDatasetByNameEA = new GetDatasetByNameEngineAction(this._engineRequest);
		this.getFirstImageOfDatasetEA = new GetFirstImageOfDatasetEngineAction(this._engineRequest);
		this.deleteDatasetEA = new DeleteDatasetEngineAction(this._engineRequest);
		this.uploadImagetoDatasetEA = new UploadImageToDatasetEngineAction(this._engineRequest);
	};

	/**
	 * Calls GetDevicesEngineAction's `run()` method
	 * @param config configuration to use for running `/devices` EngineAction
	 * @returns data returned by GetDevicesEngineAction
	 */
	public getDevices = async (config?: AxiosRequestConfig) => {
		return this.getDevicesEA.run(config);
	};

	public getJob = async (uuid: string, config?: AxiosRequestConfig) => {
		return this.getJobEA.run(config, uuid);
	};

	public createModel = async (data: object, config?: AxiosRequestConfig) => {
		return this.createModelEA.run(config, data);
	};

	public getModels = async (config?: AxiosRequestConfig) => {
		return this.getModelsEA.run(config);
	};

	public getModel = async (uuid: string, config?: AxiosRequestConfig) => {
		return this.getModelEA.run(config, uuid);
	};

	public createDataset = async (data: object, config?: AxiosRequestConfig) => {
		return this.createDatasetEA.run(config, data);
	};

	public getDatasets = async (config?: AxiosRequestConfig) => {
		return this.getDatasetsEA.run(config);
	};

	public getDataset = async (uuid: string, config?: AxiosRequestConfig) => {
		return this.getDatasetEA.run(config, uuid);
	};

	public getDatasetByName = async (name: string, config?: AxiosRequestConfig) => {
		return this.getDatasetByNameEA.run(config, name);
	};

	public getFirstImageOfDataset = async (uuid: string, config?: AxiosRequestConfig) => {
		return this.getFirstImageOfDatasetEA.run(config, uuid);
	};

	public deleteDataset = async (uuid: string, config?: AxiosRequestConfig) => {
		return this.deleteDatasetEA.run(config, uuid);
	};

	public uploadImagesToDataset = async (
		uuid: string,
		jsonData: object,
		config?: AxiosRequestConfig,
	) => {
		return this.uploadImagetoDatasetEA.run(config, [uuid, jsonData]);
	};
}

export { EngineActionHandler };