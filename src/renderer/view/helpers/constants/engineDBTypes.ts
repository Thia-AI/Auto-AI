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
