/**
 * Engine's DB dataset entry
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

export const DATASET_LABELS_SPLITTER = '|';

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
 * Engine's DB job entry
 */
export interface Job {
	id: string;
	job_name: string;
	has_started: boolean;
	has_finished: boolean;
	status: string;
	progress: number;
	progress_max: number;
	date_started: string;
	date_finished: string;
}

export const nullJob: Job = {
	id: '',
	job_name: '',
	has_started: false,
	has_finished: false,
	status: '',
	progress: 0,
	progress_max: 0,
	date_started: '',
	date_finished: '',
};
