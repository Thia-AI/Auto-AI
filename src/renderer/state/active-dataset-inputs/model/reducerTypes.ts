import { Input } from '_/renderer/view/helpers/constants/engineDBTypes';

/**
 * State for the dataset inputs that are displayed using cursor pagination.
 */
export interface IActiveDatasetInputsReducer {
	value: Input[];
}
/**
 * State for the active dataset input ID (index) that is displayed on the larger preview.
 */
export interface IActiveDatasetInputsPreviewIDReducer {
	value: number;
}
