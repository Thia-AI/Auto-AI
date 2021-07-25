import {
	IJobMonitorEvent,
	WebWorkerToRendererEventTypes,
} from '_/renderer/workers/constants/jobMonitorConstants';

/**
 * Each message event key must have a respective function that it runs
 */
interface IOnMessageMap {
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	[key: string]: (...args: any[]) => any;
}

/**
 * Singleton that handles incoming messages from job monitor web worker
 */
export class JobMonitorHandler {
	private static instance: JobMonitorHandler;

	/**
	 * Job monitor worker
	 */
	private worker!: Worker;

	private onMessageMap: IOnMessageMap = {};

	private constructor() {}

	/**
	 * Gets current instance of handler
	 * @returns JobMonitorHandler instance
	 */
	public static getInstance = (): JobMonitorHandler => {
		if (!JobMonitorHandler.instance) {
			JobMonitorHandler.instance = new JobMonitorHandler();
		}

		return JobMonitorHandler.instance;
	};

	/**
	 * Sets up the job monitor web worker
	 * @param workerURL path to web worker
	 * @returns JobMonitorHandler instance
	 */
	public setup = (workerURL: string | URL) => {
		this.worker = new Worker(workerURL);
		this.worker.onmessage = this.onMessage;
		return this;
	};

	/**
	 * Worker's onmessage function, runs respective function from {@link JobMonitorHandler.onMessageMap `onMessageMap`}
	 * depending on the {@link IJobMonitorEvent `IJobMonitorEvent`}'s event type
	 * @param ev {@link MessageEvent `MessageEvent`} sent from web worker ==> renderer
	 */
	private onMessage = (ev: MessageEvent) => {
		const data = ev.data as IJobMonitorEvent;
		// If a function for that event type exists
		if (this.onMessageMap.hasOwnProperty(data.type)) {
			const func = this.onMessageMap[data.type];
			func(data.payload);
		}
	};

	/**
	 * Starts the web worker queue
	 * @param log Whether web worker should log {@link MessageEvent `MessageEvents`}
	 */
	public startQueue = (log = false) => {
		// Enable logging on the worker
		this.changeLog(log);

		const data: IJobMonitorEvent = {
			type: 'START_JOB_MONITOR',
		};
		this.worker.postMessage(data);
	};

	/**
	 * Changes web worker log setting
	 * @param log Whether web worker should log {@link MessageEvent `MessageEvents`}
	 */
	public changeLog = (log: boolean) => {
		const data: IJobMonitorEvent = {
			type: 'CHANGE_LOG',
			payload: log,
		};

		this.worker.postMessage(data);
	};

	/**
	 * Adds job ID to web worker's monitoring queue
	 * @param jobID job ID to add for monitoring
	 */
	public addJobIDToMonitor = (jobID: string) => {
		const data: IJobMonitorEvent = {
			type: 'ADD_JOB_TO_MONITOR',
			payload: jobID,
		};

		this.worker.postMessage(data);
	};

	/**
	 * Adds entry to {@link JobMonitorHandler.onMessageMap `onMessageMap`}
	 * @param onMessageType {@link WebWorkerToRendererEventTypes event type} for web worker ==> renderer messages
	 * @param onMessageFunction Function to run when respective message type gets received from web worker
	 */
	public addOnMessageFunction = (
		onMessageType: WebWorkerToRendererEventTypes,
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		onMessageFunction: (...args: any[]) => any,
	) => {
		Object.assign(this.onMessageMap, { [onMessageType]: onMessageFunction });
	};

	/**
	 * Removes entry for a particular message type from {@link JobMonitorHandler.onMessageMap `onMessageMap`}
	 * @param onMessageType {@link WebWorkerToRendererEventTypes event type} to remove from {@link JobMonitorHandler.onMessageMap `onMessageMap`}
	 */
	public removeOnMessageFunction = (onMessageType: string) => {
		delete this.onMessageMap[onMessageType];
	};
}
