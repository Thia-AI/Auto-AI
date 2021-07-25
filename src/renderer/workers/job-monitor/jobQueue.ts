import { AxiosError } from 'axios';
import { cloneDeep } from 'lodash';
import EngineRequestConfig from '_/renderer/engine-requests/engineRequestConfig';
import { IJobMonitorEvent } from '../constants/jobMonitorConstants';
import { scope } from './worker';

/**
 * Singleton that contains IDS of jobs to check status of
 */
export class JobQueue {
	private static instance: JobQueue;

	// How often (in ms) to go through the queue
	private jobQueueTiming = 500;
	private jobIDQueue: string[] = [];
	/**
	 * Non-zero value which identifies the timer created by
	 * {@link https://developer.mozilla.org/en-US/docs/Web/API/WindowOrWorkerGlobalScope/setInterval `setInterval()`}
	 */
	private intervalID;
	/**
	 * Whether an instance of {@link JobQueue.processJobQueue `processJobQueue()`} is already running
	 * *(to prevent it to run when already running in another setInterval instance)*
	 */
	private lock = false;

	private constructor() {}

	/**
	 * Gets (or creates if doesn't exist) current JobQueue instance
	 * @returns JobQueue instance
	 */
	public static getInstance(): JobQueue {
		if (!JobQueue.instance) {
			JobQueue.instance = new JobQueue();
		}

		return JobQueue.instance;
	}
	/**
	 * Adds a job ID to monitor
	 * @param jobID uuid hex representation of the job ID to add to monitoring
	 */
	public addJob = (jobID: string) => {
		this.jobIDQueue.push(jobID);
	};

	/**
	 * Starts the interval'd queue processing
	 */
	public start = () => {
		if (!this.intervalID) {
			this.intervalID = setInterval(() => {
				this.processJobQueue();
			}, this.jobQueueTiming);
		}
	};

	/**
	 * Stops the interval'd queue processing
	 */
	public stop = () => {
		if (this.intervalID !== null) {
			clearInterval(this.intervalID);
			this.intervalID = null;
		}
	};
	/**
	 * Goes through job queue and checks whether the job has finished and notifies renderer if that's the case
	 */
	private processJobQueue = async () => {
		// Only happens if not already running and there's something in the queue
		if (!this.lock && this.jobIDQueue.length > 0) {
			this.lock = true;
			// We clone the queue so as to not modify it directly
			const jobIDQueue = cloneDeep(this.jobIDQueue);
			// Instead of checking one by one, Promise.all yields faster results
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
						payload: jobResult[1],
					};
					scope.postMessage(response);
					this.jobIDQueue.splice(i, 1);
				}
			}
			this.lock = false;
		}
	};

	/**
	 * Gets the status of a job
	 * @param jobID uuid hex representation of the job ID to get the status of
	 * @returns [false, job response object] if no error, and [true, error object] if error
	 */
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
