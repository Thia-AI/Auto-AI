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
}

export const nullDataset: Dataset = {
	id: '',
	name: '',
	type: '',
	date_created: '',
	date_last_accessed: '',
	misc_data: '',
};
