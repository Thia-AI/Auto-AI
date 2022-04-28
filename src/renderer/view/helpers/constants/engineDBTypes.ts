/**
 * **Engine**'s DB Dataset table.
 */
export interface Dataset {
	id: string;
	name: string;
	type: string;
	date_created: string;
	date_last_accessed: string;
	misc_data: string;
	labels: string;
}

/**
 * Dictionary of a Label value -> Label
 */
export interface Labels {
	[key: string]: Label;
}

/**
 * **Engine**'s DB Label table.
 */
export interface Label {
	id: string;
	value: string;
	input_count: number;
	dataset_id: string;
	color: string;
}

/**
 * Empty label.
 */
export const nullLabel: Label = {
	id: '',
	value: '',
	input_count: 2,
	dataset_id: '',
	color: '',
};

/**
 * Splitter for labels property of dataset.
 */
export const DATASET_LABELS_SPLITTER = '|';

/**
 * Empty dataset.
 */
export const nullDataset: Dataset = {
	id: '',
	name: '',
	type: '',
	date_created: '',
	date_last_accessed: '',
	misc_data: '',
	labels: '',
};

/**
 * **Engine**'s DB Job table.
 */
export interface Job {
	id: string;
	job_name: string;
	has_started: boolean;
	has_finished: boolean;
	has_cancelled: boolean;
	status: string;
	progress: number;
	progress_max: number;
	date_started: string;
	date_finished: string;
	extra_data: any | null; // eslint-disable-line @typescript-eslint/no-explicit-any
}

/**
 * Empty job.
 */
export const nullJob: Job = {
	id: '',
	job_name: '',
	has_started: false,
	has_finished: false,
	has_cancelled: false,
	status: '',
	progress: 0,
	progress_max: 0,
	date_started: '',
	date_finished: '',
	extra_data: null,
};

/**
 * **Engine**'s DB Input table.
 */
export interface Input {
	dataset_id: string;
	date_created: string;
	file_name: string;
	id: string;
	label: string;
}

/**
 * Constant for value of an unlabelled input's `label`.
 */
export const UNLABBELED_INPUT_VALUE_LABEL = 'unlabelled';

/**
 * Empty input.
 */
export const nullInput: Input = {
	dataset_id: '',
	date_created: '',
	file_name: '',
	id: '',
	label: '',
};

/**
 * Different statuses a model can be in. **MUST** be exactly the same as `ModelStatus` Enum in constants.py of **Engine**.
 */
export enum ModelStatus {
	IDLE = 'IDLE',
	TRAINING = 'TRAINING',
	STARTING_TRAINING = 'STARTING_TRAINING',
	TRAINED = 'TRAINED',
	RETRAINING = 'RETRAINING',
	ERROR = 'ERROR',
}
/**
 * Type that represents all model statuses.
 */
export type PossibleModelStatuses = keyof typeof ModelStatus;

/**
 * Different statuses of a model being exported.
 */
export enum ModelExportStatus {
	EXPORTING = 'EXPORTING',
	EXPORTED = 'EXPORTED',
	ERROR = 'ERROR',
}

/**
 * Type that represents all model export statuses.
 */
export type PossibleModelExportStatuses = keyof typeof ModelExportStatus;

/**
 * Different export types for a model.
 */
export enum ModelExportType {
	SAVED_MODEL = 'SAVED_MODEL',
	LITE = 'LITE',
	JS = 'JS',
}

/**
 * Type that represents all possible model exports.
 */
export type PossibleModelExportTypes = keyof typeof ModelExportType;

/**
 * **Engine**'s DB Exports table.
 */
export interface Export {
	id: string;
	export_status: PossibleModelExportStatuses;
	export_type: PossibleModelExportTypes;
	save_path: string;
	export_job_id: string;
	model_id: string;
	export_date: string;
}

/**
 * Empty export.
 */
export const nullExport: Export = {
	id: '',
	export_date: '',
	export_status: 'EXPORTING',
	export_type: 'SAVED_MODEL',
	save_path: '',
	model_id: '',
	export_job_id: '',
};

/**
 * **Engine**'s DB Models table.
 */
export interface Model {
	id: string;
	model_name: string;
	model_type: string;
	model_type_extra: string;
	date_created: string;
	date_last_accessed: string;
	model_status: PossibleModelStatuses;
	latest_train_job_id: string | null;
	extra_data: {
		trained_model: {
			labels_to_class_map: {
				[key: string]: number;
			};
			labels_trained_on: {
				[key: string]: Label;
			};
		};
	} | null;
}

/**
 * Empty model.
 */
export const nullModel: Model = {
	id: '',
	model_name: '',
	model_type: '',
	model_type_extra: '',
	date_created: '',
	date_last_accessed: '',
	model_status: ModelStatus.IDLE,
	latest_train_job_id: null,
	extra_data: null,
};

/**
 * Different statuses a training job can be in. **MUST** be exactly the same as `TrainJobStatus` Enum in constants.py of **Engine**.
 */
export enum TrainJobStatus {
	TRAINING = 'TRAINING',
	STARTING_TRAINING = 'STARTING_TRAINING',
	TRAINED = 'TRAINED',
	EVALUATING = 'EVALUATING',
	EVALUATED = 'EVALUATED',
	ERROR = 'ERROR',
}
/**
 * Type that represents all training job statuses.
 */
export type PossibleTrainJobStatuses = keyof typeof TrainJobStatus;

/**
 * **Engine**'s DB Job table for a training related job.
 */
export interface TrainJob extends Job {
	extra_data: {
		history?: {
			accuracy: number[];
			val_accuracy: number[];
			loss: number[];
			val_loss: number[];
			auc: number[];
			val_auc: number[];
			prc: number[];
			val_prc: number[];
			precision: number[];
			val_precision: number[];
			recall: number[];
			val_recall: number[];
		};
		evaluation_result?: {
			accuracy: number;
			loss: number;
			auc: number;
			prc: number;
			precision: number;
			recall: number;
		};
		model_id?: string;
		model_name?: string;
		status?: PossibleTrainJobStatuses;
		status_description?: string;
	} | null;
}

/**
 * Empty train related job.
 */
export const nullTrainJob: TrainJob = {
	id: '',
	job_name: '',
	has_started: false,
	has_finished: false,
	has_cancelled: false,
	status: '',
	progress: 0,
	progress_max: 0,
	date_started: '',
	date_finished: '',
	extra_data: null,
};

/**
 * **Engine**'s DB Job table for a testing related job.
 */
export interface TestJob extends Job {
	extra_data: {
		predictions: string[];
	} | null;
}

/**
 * Empty test related job.
 */
export const nullTestJob: TestJob = {
	id: '',
	job_name: '',
	has_started: false,
	has_finished: false,
	has_cancelled: false,
	status: '',
	progress: 0,
	progress_max: 0,
	date_started: '',
	date_finished: '',
	extra_data: null,
};
