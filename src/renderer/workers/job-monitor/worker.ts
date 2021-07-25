import { IJobMonitorEvent, workerSettings } from '../constants/jobMonitorConstants';
import { messageMap } from './messages';

/**
 * Entry point of the web worker
 */
export const scope = self as unknown as Worker;

scope.addEventListener('message', (event) => {
	// Run respective function for each message
	const data = event.data as IJobMonitorEvent;
	const func = messageMap[data.type];
	logMessage(data, workerSettings.log);
	func(data.payload);
});

/**
 * Logs message data sent to web worker to console
 * @param data Web worker MessageEvent
 * @param log Whether to log or not
 */
const logMessage = (data: IJobMonitorEvent, log = true) => {
	if (log) {
		// Logs in a group with some CSS styling (can be changed later to look more appealing)
		console.groupCollapsed(
			`%c Job Monitor %c- ${data.type}`,
			'font-weight: lighter; color: #baa9d4',
			'color: white',
		);
		console.log(data);
		console.groupEnd();
	}
};
