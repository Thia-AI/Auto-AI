// State for whether model selection modal is opened or not
export interface IOpenCloseModelSelectionReducer {
	value: boolean;
}

// State for which model is selected (for description viewing)
export interface ISelectedModelReducer {
	value: number;
}
