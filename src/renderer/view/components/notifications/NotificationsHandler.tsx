import React, { useEffect, useState } from 'react';

import { ipcRenderer } from 'electron';
import { useToast } from '@chakra-ui/toast';
import { connect } from 'react-redux';
import { IJobNotification } from '_/renderer/state/notifications/model/actionTypes';
import { notifSendAction } from '_/renderer/state/notifications/NotificationActions';
import { IAppState } from '_/renderer/state/reducers';
import { Job } from '../../helpers/constants/engineDBTypes';
import { JobMonitorHandler } from '../../worker-handlers/JobMonitorHandler';

interface Props {
	notifications: IJobNotification[];
	sendNotification: (notification: IJobNotification) => void;
}

const NotificationsHandlerC = React.memo(({ notifications, sendNotification }: Props) => {
	const toast = useToast();
	/**
	 * Map of jobID -> Notification key-value pair that represents the "active" notifications
	 */
	interface INotificationMap {
		[jobID: string]: IJobNotification;
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
				if (!document.hasFocus()) {
					(async function () {
						await ipcRenderer.invoke(
							'notificationsHandler:showNotification',
							'Job Update',
							`Finished ${notif.job.job_name} job`,
						);
					})();
				}
				// Show UI notification regardless
				toast({
					title: 'Success',
					description: `Finished ${notif.job.job_name} job`,
					status: 'success',
					duration: notif.dismissAfter,
					isClosable: false,
				});
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
