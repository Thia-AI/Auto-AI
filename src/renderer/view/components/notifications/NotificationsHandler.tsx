import React, { useEffect, useState } from 'react';

import { remote, ipcRenderer } from 'electron';
import { connect } from 'react-redux';
import { INotification } from '_/renderer/state/notifications/model/actionTypes';
import { notifSendAction } from '_/renderer/state/notifications/NotificationActions';
import { IAppState } from '_/renderer/state/reducers';
import { Job } from '../../helpers/constants/engineDBTypes';
import { JobMonitorHandler } from '../../worker-handlers/JobMonitorHandler';

interface Props {
	notifications: INotification[];
	sendNotification: (notification: INotification) => void;
}

const NotificationsHandlerC = React.memo(({ notifications, sendNotification }: Props) => {
	// Use remote to send native notifications through electron
	const Notification = remote.Notification;
	/**
	 * Map of jobID -> Notification key-value pair that represents the "active" notifications
	 */
	interface INotificationMap {
		[jobID: string]: INotification;
	}

	const [notificationMap, setNotificationMap] = useState<INotificationMap>({});

	// On mount
	useEffect(() => {
		// Setup the JobMonitorHandler with the web worker file output by webpack, and start it's queue monitoring
		JobMonitorHandler.getInstance().setup('./job-monitor-worker.bundle.js').startQueue(true);
		// When a job is finished, send notification action
		JobMonitorHandler.getInstance().addOnMessageFunction('JOB_FINISHED', (job) =>
			sendNotification({
				job: job as Job,
				dismissAfter: 1250,
			}),
		);
	}, []);

	// For each time notifications change
	useEffect(() => {
		const newNotifMap: INotificationMap = {};
		// Get new notifications
		for (let i = 0; i < notifications.length; i++) {
			const notif = notifications[i];
			if (!notificationMap.hasOwnProperty(notif.job.id)) {
				// This is a new notification, send it!!
				const nativeNotif = new Notification({
					title: 'Job Update',
					body: `Finished ${notif.job.job_name} job`,
				});
				nativeNotif.on('click', async (e) => {
					e.preventDefault();
					// If clicked, make the App be focused
					await ipcRenderer.invoke('window:focus');
				});
				nativeNotif.show();
			}
			// Update notificationMap
			newNotifMap[notif.job.id] = notif;
		}
		setNotificationMap(newNotifMap);
	}, [notifications]);
	return <></>;
});

const mapStateToProps = (state: IAppState) => ({
	notifications: state.notifications.value,
});

/**
 * Component that manages sending notifications to UI & Native OS
 */
export const NotificationsHandler = connect(mapStateToProps, {
	sendNotification: notifSendAction,
})(NotificationsHandlerC);
