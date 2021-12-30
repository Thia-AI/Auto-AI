import React, { useEffect, useState } from 'react';

import { ipcRenderer } from 'electron';
import { useToast } from '@chakra-ui/toast';
import { connect } from 'react-redux';
import { IJobNotification } from '_/renderer/state/notifications/model/actionTypes';
import { notifSendAction } from '_/renderer/state/notifications/NotificationActions';
import { IAppState } from '_/renderer/state/reducers';
import { Job } from '../../helpers/constants/engineDBTypes';
import { IEngineStatusReducer } from '_/renderer/state/engine-status/model/reducerTypes';
import EngineRequestConfig from '_/renderer/engine-requests/engineRequestConfig';
import { AxiosError } from 'axios';

interface Props {
	notifications: IJobNotification[];
	engineStarted: IEngineStatusReducer;
	sendNotification: (notification: IJobNotification) => void;
}

const NotificationsHandlerC = React.memo(
	({ notifications, sendNotification, engineStarted }: Props) => {
		const toast = useToast();
		/**
		 * Map of jobID -> Notification key-value pair that represents the "active" notifications
		 */
		interface INotificationMap {
			[jobID: string]: IJobNotification;
		}

		const [notificationMap, setNotificationMap] = useState<INotificationMap>({});
		const setupSocket = async () => {
			await ipcRenderer.invoke('engine:connectSocket');
		};
		// On mount
		useEffect(() => {
			if (engineStarted.value) {
				setupSocket();
			}
		}, [engineStarted]);
		/**
		 * Gets the status of a job
		 * @param jobID uuid hex representation of the job ID to get the status of
		 * @returns [false, job response object] if no error, and [true, error object] if error
		 */
		const getJobIDStatus = async (jobID: string): Promise<[boolean, Job]> => {
			try {
				const res = await EngineRequestConfig.get(`/job/${jobID}`);
				return [false, res.data];
			} catch (_err) {
				const err = _err as AxiosError;
				return [true, err.response?.data];
			}
		};

		useEffect(() => {
			ipcRenderer.on('engine:jobFinished', async (e, jobID: string) => {
				// TODO: Do something when there's an error (maybe there needs to be a universal retry/error)
				// system.
				const [wasError, job] = await getJobIDStatus(jobID);
				sendNotification({
					job: job as Job,
					dismissAfter: 1250,
				});
			});
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
	},
);

const mapStateToProps = (state: IAppState) => ({
	notifications: state.notifications.value,
	engineStarted: state.engineStarted,
});

/**
 * Component that manages sending notifications to UI & Native OS
 */
export const NotificationsHandler = connect(mapStateToProps, {
	sendNotification: notifSendAction,
})(NotificationsHandlerC);
