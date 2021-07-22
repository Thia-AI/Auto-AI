import { AxiosError } from 'axios';
import { cloneDeep } from 'lodash';
import EngineRequestConfig from '_/renderer/engine-requests/engineRequestConfig';
import { IJobMonitorEvent } from '../constants/jobMonitorConstants';
import { scope } from './worker';

export class JobQueue {
	private static instance: JobQueue;

	private jobQueueTiming = 1250;
	private jobIDQueue: string[] = [];
	private intervalID;
	private lock = false;

	private constructor() {}

	public static getInstance(): JobQueue {
		if (!JobQueue.instance) {
			JobQueue.instance = new JobQueue();
		}

		return JobQueue.instance;
	}

	public addJob = (jobID: string) => {
		this.jobIDQueue.push(jobID);
	};

	public start = () => {
		if (!this.intervalID) {
			this.intervalID = setInterval(() => {
				this.processJobQueue();
			}, this.jobQueueTiming);
		}
	};

	public stop = () => {
		if (this.intervalID !== null) {
			clearInterval(this.intervalID);
			this.intervalID = null;
		}
	};
	private processJobQueue = async () => {
		if (!this.lock && this.jobIDQueue.length > 0) {
			this.lock = true;
			const jobIDQueue = cloneDeep(this.jobIDQueue);
			const jobPromises: Promise<[boolean, object]>[] = [];
			for (let i = 0; i < jobIDQueue.length; i++) {
				const jobID = jobIDQueue[i];
				jobPromises.push(this.getJobIDStatus(jobID));
			}
			const jobPromiseResults = await Promise.all(jobPromises);
			for (let i = 0; i < jobPromiseResults.length; i++) {
				const jobResult = jobPromiseResults[i];
				if (jobResult[0]) {
					// Error retrieving job ID (for some reason, shouldn't occur in theory)
					// Remove from queue
					this.jobIDQueue.splice(i, 1);
					continue;
				} else if (jobResult[1]['has_finished']) {
					// Job has finished, remove from queue and notify renderer
					const response: IJobMonitorEvent = {
						type: 'JOB_FINISHED',
						payload: jobResult[1]['id'],
					};
					scope.postMessage(response);
					this.jobIDQueue.splice(i, 1);
				}
			}

			this.lock = false;
		}
	};

	private getJobIDStatus = async (jobID: string): Promise<[boolean, object]> => {
		try {
			const res = await EngineRequestConfig.get(`/job/${jobID}`);
			return [false, res.data];
		} catch (_err) {
			const err = _err as AxiosError;
			return [true, err.response?.data];
		}
	};
}
