import { JobQueue } from './jobQueue';
import { changeLogSettings } from '../constants/jobMonitorConstants';

/**
 * Map representing which function to run for a message event type
 */
export const messageMap = {
	START_JOB_MONITOR: JobQueue.getInstance().start,
	CHANGE_LOG: changeLogSettings,
	ADD_JOB_TO_MONITOR: JobQueue.getInstance().addJob,
};
