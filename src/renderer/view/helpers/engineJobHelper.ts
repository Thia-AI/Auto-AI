import { AxiosRequestConfig } from 'axios';
import { EngineActionHandler } from '_engine_requests/engineActionHandler';

/**
 * Helper method that waits until an Engine job has completed.
 *
 * @param jobId Job ID retrieved when starting a job.
 * @param timeout How often should it should sleep for before making the next request.
 * @returns Array of 2 -> [whether error occurred (boolean), response data (object)].
 */
export const waitTillEngineJobComplete = async (jobId: string, timeout = 1000) => {
	do {
		const config: AxiosRequestConfig = {
			timeout,
		};
		const initialTime = new Date().getTime();
		const [err, resData] = await EngineActionHandler.getInstance().getJob(jobId, config);
		if (err || resData.has_finished) {
			return [err, resData];
		}
		const afterTime = new Date().getTime();
		// sleep for difference
		await sleep(Math.abs(timeout - (afterTime - initialTime)));
	} while (true);
};

/**
 * Helper method to sleep in async/await.
 *
 * @param ms Milliseconds to sleep for.
 * @returns A {@link Promise `promise`} that needs to be `await`-ed.
 */
export const sleep = (ms: number) => {
	return new Promise((resolve) => setTimeout(resolve, ms));
};
