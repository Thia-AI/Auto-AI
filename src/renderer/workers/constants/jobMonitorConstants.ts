// renderer <==> web worker broasdcast channel data type
export interface IJobMonitorEvent {
	type: RendererToWebWorkerEventTypes | WebWorkerToRendererEventTypes;
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	payload?: any;
}

// Message types for renderer ==> web worker communication
export const START_JOB_MONITOR = 'START_JOB_MONITOR';

export const CHANGE_LOG = 'CHANGE_LOG';

export const ADD_JOB_TO_MONITOR = 'ADD_JOB_TO_MONITOR';

export type RendererToWebWorkerEventTypes =
	| typeof START_JOB_MONITOR
	| typeof CHANGE_LOG
	| typeof ADD_JOB_TO_MONITOR;

// Message types for renderer <== web worker communication
export const JOB_FINISHED = 'JOB_FINISHED';

// Union of all message types for renderer <== web worker communication
export type WebWorkerToRendererEventTypes = typeof JOB_FINISHED;

// Object containing the default settings to run the worker with.
// Can be changed on the fly
export const workerSettings = {
	log: false,
};

/**
 * Change whether we want the worker to log each message
 * @param log New value for log
 */
export const changeLogSettings = (log: boolean) => {
	workerSettings.log = log;
};
