import { Input } from '_/renderer/view/helpers/constants/engineTypes';

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

/**
 * State for the next page cursor (or null if no next page) for dataset inputs.
 */
export interface INextPageCursorReducer {
	value: string | null;
}

/**
 * State for the previous page cursor (or null if no previous page) for dataset inputs.
 */
export interface IPreviousPageCursorReducer {
	value: string | null;
}
