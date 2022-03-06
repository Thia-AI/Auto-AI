import { AxiosInstance, AxiosRequestConfig } from 'axios';
import { DeleteAllInputsFromDatasetEngineAction } from './actions/delete/deleteAllInputsFromDataset';
import { DeleteDatasetEngineAction } from './actions/delete/deleteDataset';
import { DeleteLabelEngineAction, IDeleteLabelData } from './actions/delete/deleteLabel';
import { GetDatasetEngineAction } from './actions/get/getDataset';
import { GetDatasetByNameEngineAction } from './actions/get/getDatasetByName';
import { GetDatasetsEngineAction } from './actions/get/getDatasets';
import { GetDevicesEngineAction } from './actions/get/getDevices';
import { GetJobEngineAction } from './actions/get/getJob';
import { GetModelEngineAction } from './actions/get/getModel';
import { GetModelsEngineAction } from './actions/get/getModels';
import { GetNextPageEngineAction, IGetNextPageData } from './actions/post/getNextPage';
import { GetPreviousPageEngineAction, IGetPreviousPageData } from './actions/post/getPreviousPage';
import { UpdateLabelsOrderEngineAction } from './actions/patch/updateLabelsOrder';
import { AddLabelEngineAction, IAddLabelData } from './actions/post/addLabel';
import { CreateDatasetEngineAction } from './actions/post/createDataset';
import { CreateModelEngineAction } from './actions/post/createModel';
import { UploadImageToDatasetEngineAction } from './actions/post/uploadImageToDataset';
import { GetDatasetLabelsEngineAction } from './actions/get/getDatasetLabels';
import { GetDatasetLabelEngineAction, IGetDatasetLabelData } from './actions/get/getDatasetLabel';
import { UpdateInputLabelData, UpdateInputLabelEngineAction } from './actions/put/updateInputLabel';
import { ITrainModelData, TrainModelEngineAction } from './actions/post/trainModel';
import { GetTrainJobEngineAction } from './actions/get/getTrainJobs';
import { TestModelEngineAction } from './actions/post/testModel';
import { GetTelemetryGPUStateEngineAction } from './actions/get/getTelemetryGPUState';
import { CancelJobEA } from './actions/delete/cancelJob';

/**
 * Class that manages all EngineActions.
 */
class EngineActionHandler {
	private static instance: EngineActionHandler;

	// Engine status
	private getDevicesEA!: GetDevicesEngineAction;
	// Jobs
	private getJobEA!: GetJobEngineAction;
	private getTrainJobEA!: GetTrainJobEngineAction;
	private cancelJobEA!: CancelJobEA;
	// Models
	private createModelEA!: CreateModelEngineAction;
	private getModelsEA!: GetModelsEngineAction;
	private getModelEA!: GetModelEngineAction;
	private trainModelEA!: TrainModelEngineAction;
	private testModelEA!: TestModelEngineAction;
	// Datasets
	private createDatasetEA!: CreateDatasetEngineAction;
	private getDatasetsEA!: GetDatasetsEngineAction;
	private getDatasetEA!: GetDatasetEngineAction;
	private getDatasetByNameEA!: GetDatasetByNameEngineAction;
	private getPreviousPageEA!: GetPreviousPageEngineAction;
	private getNextPageEA!: GetNextPageEngineAction;
	private deleteDatasetEA!: DeleteDatasetEngineAction;
	private deleteAllInputsFromDatasetEA!: DeleteAllInputsFromDatasetEngineAction;
	private uploadImagetoDatasetEA!: UploadImageToDatasetEngineAction;
	// Dataset Labels
	private addLabelToDatasetEA!: AddLabelEngineAction;
	private deleteLabelFromDatasetEA!: DeleteLabelEngineAction;
	private updateLabelsOrderEA!: UpdateLabelsOrderEngineAction;
	private getDatasetLabelsEA!: GetDatasetLabelsEngineAction;
	private getDatasetLabelEA!: GetDatasetLabelEngineAction;
	private updateInputLabelEA!: UpdateInputLabelEngineAction;
	// Telemetry
	private getTelemetryGPUStateEA!: GetTelemetryGPUStateEngineAction;

	private _engineRequest!: AxiosInstance;

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
	public static getInstance(): EngineActionHandler {
		if (!EngineActionHandler.instance) {
			EngineActionHandler.instance = new EngineActionHandler();
		}

		return EngineActionHandler.instance;
	}

	/**
	 * Getter for _engineRequest.
	 *
	 * @returns The engineRequest object.
	 */
	get engineRequest() {
		return this._engineRequest;
	}

	/**
	 * Setter for _engineRequest.
	 */
	set engineRequest(eR: AxiosInstance) {
		this._engineRequest = eR;
	}

	/**
	 * Initializes EngineActionHandler.
	 *
	 * @param eR EngineRequest instance to set as the AxiosInstance to use for EngineActions.
	 */
	public initInstances = (eR: AxiosInstance) => {
		this.engineRequest = eR;
		// Engine status
		this.getDevicesEA = new GetDevicesEngineAction(this._engineRequest);
		// Jobs
		this.getJobEA = new GetJobEngineAction(this._engineRequest);
		this.getTrainJobEA = new GetTrainJobEngineAction(this._engineRequest);
		this.cancelJobEA = new CancelJobEA(this._engineRequest);
		// Models
		this.createModelEA = new CreateModelEngineAction(this._engineRequest);
		this.getModelsEA = new GetModelsEngineAction(this._engineRequest);
		this.getModelEA = new GetModelEngineAction(this._engineRequest);
		this.trainModelEA = new TrainModelEngineAction(this._engineRequest);
		this.testModelEA = new TestModelEngineAction(this._engineRequest);
		// Datasets
		this.createDatasetEA = new CreateDatasetEngineAction(this._engineRequest);
		this.getDatasetsEA = new GetDatasetsEngineAction(this._engineRequest);
		this.getDatasetEA = new GetDatasetEngineAction(this._engineRequest);
		this.getDatasetByNameEA = new GetDatasetByNameEngineAction(this._engineRequest);
		this.getPreviousPageEA = new GetPreviousPageEngineAction(this._engineRequest);
		this.getNextPageEA = new GetNextPageEngineAction(this._engineRequest);
		this.deleteDatasetEA = new DeleteDatasetEngineAction(this._engineRequest);
		this.uploadImagetoDatasetEA = new UploadImageToDatasetEngineAction(this._engineRequest);
		this.deleteAllInputsFromDatasetEA = new DeleteAllInputsFromDatasetEngineAction(this._engineRequest);
		// Dataset Labels
		this.addLabelToDatasetEA = new AddLabelEngineAction(this._engineRequest);
		this.updateLabelsOrderEA = new UpdateLabelsOrderEngineAction(this._engineRequest);
		this.deleteLabelFromDatasetEA = new DeleteLabelEngineAction(this._engineRequest);
		this.getDatasetLabelsEA = new GetDatasetLabelsEngineAction(this._engineRequest);
		this.getDatasetLabelEA = new GetDatasetLabelEngineAction(this._engineRequest);
		this.updateInputLabelEA = new UpdateInputLabelEngineAction(this._engineRequest);
		// Telemetry
		this.getTelemetryGPUStateEA = new GetTelemetryGPUStateEngineAction(this._engineRequest);
	};

	/**
	 * Calls GetDevicesEngineAction's `run()` method.
	 *
	 * @param config Configuration to use for running `/devices` EngineAction.
	 * @returns Data returned by GetDevicesEngineAction.
	 */
	public getDevices = async (config?: AxiosRequestConfig) => {
		return this.getDevicesEA.run(config);
	};

	public getJob = async (uuid: string, config?: AxiosRequestConfig) => {
		return this.getJobEA.run(config, uuid);
	};

	public getTrainJob = async (trainJobID: string, config?: AxiosRequestConfig) => {
		return this.getTrainJobEA.run(config, trainJobID);
	};

	public cancelJob = async (jobID: string, config?: AxiosRequestConfig) => {
		return this.cancelJobEA.run(config, jobID);
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

	public getPreviousPage = async (uuid: string, currentCursorDate: string, config?: AxiosRequestConfig) => {
		const data: IGetPreviousPageData = {
			datasetID: uuid,
			data: {
				current_cursor_date: currentCursorDate,
			},
		};

		return this.getPreviousPageEA.run(config, data);
	};

	public getNextPage = async (uuid: string, currentCursorDate: string, config?: AxiosRequestConfig) => {
		const data: IGetNextPageData = {
			datasetID: uuid,
			data: {
				current_cursor_date: currentCursorDate,
			},
		};

		return this.getNextPageEA.run(config, data);
	};

	public deleteDataset = async (uuid: string, config?: AxiosRequestConfig) => {
		return this.deleteDatasetEA.run(config, uuid);
	};

	public deleteAllInputsFromDataset = (uuid: string, config?: AxiosRequestConfig) => {
		return this.deleteAllInputsFromDatasetEA.run(config, uuid);
	};

	public uploadImagesToDataset = async (uuid: string, jsonData: object, config?: AxiosRequestConfig) => {
		return this.uploadImagetoDatasetEA.run(config, [uuid, jsonData]);
	};

	public addLabelToDataset = async (uuid: string, jsonData: IAddLabelData, config?: AxiosRequestConfig) => {
		return this.addLabelToDatasetEA.run(config, [uuid, jsonData]);
	};

	public deleteLabelFromDataset = async (uuid: string, jsonData: IDeleteLabelData, config?: AxiosRequestConfig) => {
		return this.deleteLabelFromDatasetEA.run(config, [uuid, jsonData]);
	};

	public getDatasetLabels = async (uuid: string, config?: AxiosRequestConfig) => {
		return this.getDatasetLabelsEA.run(config, uuid);
	};

	public getDatasetLabel = async (datasetID: string, labelValue: string, config?: AxiosRequestConfig) => {
		const data: IGetDatasetLabelData = {
			datasetID,
			labelValue,
		};
		return this.getDatasetLabelEA.run(config, data);
	};

	public updateLabelsOrder = async (uuid: string, jsonData: object, config?: AxiosRequestConfig) => {
		return this.updateLabelsOrderEA.run(config, [uuid, jsonData]);
	};

	public updateInputLabel = async (inputID: string, data: UpdateInputLabelData, config?: AxiosRequestConfig) => {
		return this.updateInputLabelEA.run(config, [inputID, data]);
	};

	public trainModel = async (modelID: string, data: ITrainModelData, config?: AxiosRequestConfig) => {
		return this.trainModelEA.run(config, [modelID, data]);
	};

	public testModel = async (modelID: string, data: FormData, config?: AxiosRequestConfig) => {
		return this.testModelEA.run(config, [modelID, data]);
	};

	public getTelemeteryGPUState = async (config?: AxiosRequestConfig) => {
		return this.getTelemetryGPUStateEA.run(config);
	};
}

export { EngineActionHandler };
