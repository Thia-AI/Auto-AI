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
	status: string;
	progress: number;
	progress_max: number;
	date_started: string;
	date_finished: string;
}

/**
 * Empty job.
 */
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
export const UNLABBELED_INPUT_VALUE = 'unlabelled';

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
