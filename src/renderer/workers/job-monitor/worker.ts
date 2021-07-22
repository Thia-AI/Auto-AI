import { IJobMonitorEvent, workerSettings } from '../constants/jobMonitorConstants';
import { messageMap } from './messages';

export const scope = self as unknown as Worker;

scope.addEventListener('message', (event) => {
	// Create instance if not already created
	const data = event.data as IJobMonitorEvent;
	const func = messageMap[data.type];
	logMessage(data, workerSettings.log);
	func(data.payload);
});

const logMessage = (data: IJobMonitorEvent, log = true) => {
	if (log) {
		console.groupCollapsed(
			`%c Job Monitor %c- ${data.type}`,
			'font-weight: lighter; color: #baa9d4',
			'color: white',
		);
		console.log(data);
		console.groupEnd();
	}
};
