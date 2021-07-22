import React, { useEffect } from 'react';

import { connect } from 'react-redux';
import { INotification } from '_/renderer/state/notifications/model/actionTypes';
import { notifSendAction } from '_/renderer/state/notifications/NotificationActions';
import { IAppState } from '_/renderer/state/reducers';
import { JobMonitorHandler } from '../../worker-handlers/JobMonitorHandler';

interface Props {
	notifications: INotification[];
	sendNotification: (notification: INotification) => void;
}

const NotificationsHandlerC = React.memo(({ notifications, sendNotification }: Props) => {
	useEffect(() => {
		JobMonitorHandler.getInstance().setup('./job-monitor-worker.bundle.js').startQueue(true);
		JobMonitorHandler.getInstance().addOnMessageFunction('JOB_FINISHED', (jobID) =>
			sendNotification({
				name: jobID,
			}),
		);
	}, []);

	useEffect(() => {
		console.log(notifications);
	}, [notifications]);
	return <></>;
});

const mapStateToProps = (state: IAppState) => ({
	notifications: state.notifications.value,
});
export const NotificationsHandler = connect(mapStateToProps, {
	sendNotification: notifSendAction,
})(NotificationsHandlerC);
