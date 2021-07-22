import {
	IJobMonitorEvent,
	WebWorkerToRendererEventTypes,
} from '_/renderer/workers/constants/jobMonitorConstants';

interface IOnMessageMap {
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	[key: string]: (...args: any[]) => any;
}

export class JobMonitorHandler {
	private static instance: JobMonitorHandler;

	private worker!: Worker;
	private onMessageMap: IOnMessageMap = {};

	private constructor() {}

	public static getInstance = (): JobMonitorHandler => {
		if (!JobMonitorHandler.instance) {
			JobMonitorHandler.instance = new JobMonitorHandler();
		}

		return JobMonitorHandler.instance;
	};

	public setup = (workerURL: string | URL) => {
		this.worker = new Worker(workerURL);
		this.worker.onmessage = this.onMessage;
		return this;
	};

	private onMessage = (ev: MessageEvent) => {
		const data = ev.data as IJobMonitorEvent;
		// If a function for that event type exists
		if (this.onMessageMap.hasOwnProperty(data.type)) {
			const func = this.onMessageMap[data.type];
			func(data.payload);
		}
	};

	public startQueue = (log = false) => {
		// Enable logging on the worker
		this.changeLog(log);

		const data: IJobMonitorEvent = {
			type: 'START_JOB_MONITOR',
		};
		this.worker.postMessage(data);
	};

	public changeLog = (log: boolean) => {
		const data: IJobMonitorEvent = {
			type: 'CHANGE_LOG',
			payload: log,
		};

		this.worker.postMessage(data);
	};

	public addJobIDToMonitor = (jobID: string) => {
		const data: IJobMonitorEvent = {
			type: 'ADD_JOB_TO_MONITOR',
			payload: jobID,
		};

		this.worker.postMessage(data);
	};

	public addOnMessageFunction = (
		onMessageType: WebWorkerToRendererEventTypes,
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		onMessageFunction: (...args: any[]) => any,
	) => {
		Object.assign(this.onMessageMap, { [onMessageType]: onMessageFunction });
	};

	public removeOnMessageFunction = (onMessageType: string) => {
		delete this.onMessageMap[onMessageType];
	};
}
