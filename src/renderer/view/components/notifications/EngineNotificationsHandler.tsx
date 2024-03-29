import React, { useEffect, useState } from 'react';

import { ipcRenderer } from 'electron';
import { connect } from 'react-redux';
import { IJobNotification } from '_/renderer/state/notifications/model/actionTypes';
import { notifSendAction } from '_/renderer/state/notifications/NotificationActions';
import { IAppState } from '_/renderer/state/reducers';
import {
	IMAGE_CLASSIFICATION_TEST_JOB_NAME,
	IMAGE_CLASSIFICATION_TRAIN_JOB_NAME,
	Job,
	TestJob,
	TrainJob,
} from '../../helpers/constants/engineTypes';
import { IEngineStatusReducer } from '_/renderer/state/engine-status/model/reducerTypes';
import EngineRequestConfig from '_/shared/engineRequestConfig';
import { AxiosError } from 'axios';
import { IPC_CONNECT_SOCKET, IPC_ENGINE_JOB_FINISHED, IPC_NOTIFICATIONS_SHOW_NOTIFICATION } from '_/shared/ipcChannels';
import { toast } from '../../helpers/functionHelpers';
import { useUser } from 'reactfire';

interface Props {
	notifications: IJobNotification[];
	engineStarted: IEngineStatusReducer;
	sendNotification: (notification: IJobNotification) => void;
}

interface DoOSNotificationOptions {
	title: string;
	description: string;
}
const EngineNotificationsHandlerC = React.memo(({ notifications, sendNotification, engineStarted }: Props) => {
	/**
	 * Map of jobID -> Notification key-value pair that represents the "active" notifications
	 */
	interface INotificationMap {
		[jobID: string]: IJobNotification;
	}

	const [notificationMap, setNotificationMap] = useState<INotificationMap>({});
	const { data: user } = useUser();

	const setupSocket = async () => {
		await ipcRenderer.invoke(IPC_CONNECT_SOCKET);
	};
	// On mount
	useEffect(() => {
		if (engineStarted.value) {
			setupSocket();
		}
	}, [engineStarted]);
	/**
	 * Gets the status of a job.
	 *
	 * @param jobID UUID hex representation of the job ID to get the status of.
	 * @returns `[false, job response object]` if no error, and `[true, error object]` if error.
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
		ipcRenderer.on(IPC_ENGINE_JOB_FINISHED, async (e, jobID: string) => {
			// TODO: Do something when there's an error (maybe there needs to be a universal retry/error)
			// system.
			const [_wasError, job] = await getJobIDStatus(jobID);
			sendNotification({
				job: job as Job,
				dismissAfter: 3500,
			});
		});
	}, []);

	const doOSNotification = ({ title, description }: DoOSNotificationOptions) => {
		if (!document.hasFocus()) {
			(async function () {
				await ipcRenderer.invoke(IPC_NOTIFICATIONS_SHOW_NOTIFICATION, title, description);
			})();
		}
	};

	// For each time notifications change
	useEffect(() => {
		if (!user) return;
		const newNotifMap: INotificationMap = {};
		// Get new notifications
		for (let i = 0; i < notifications.length; i++) {
			const notif = notifications[i];
			if (!notificationMap.hasOwnProperty(notif.job.id)) {
				// This is a new notification, send it!!

				let trainingTestingJobError = false;
				if (notif.job.job_name == IMAGE_CLASSIFICATION_TRAIN_JOB_NAME) {
					const job = notif.job as TrainJob;
					if (job.extra_data?.error) {
						// There was an error during training
						trainingTestingJobError = true;
						doOSNotification({
							title: `${job.job_name} Job Encountered an Error`,
							description: job.extra_data.error.title,
						});
						toast({
							title: job.extra_data.error.title,
							description: job.extra_data.error.verboseMessage,
							status: 'error',
							duration: notif.dismissAfter,
							isClosable: false,
							uid: user.uid,
						});
					}
				}
				if (notif.job.job_name == IMAGE_CLASSIFICATION_TEST_JOB_NAME) {
					const job = notif.job as TestJob;
					if (job.extra_data?.error) {
						trainingTestingJobError = true;
						doOSNotification({
							title: `${job.job_name} Job Encountered an Error`,
							description: job.extra_data.error.title,
						});
						toast({
							title: job.extra_data.error.title,
							description: job.extra_data.error.verboseMessage,
							status: 'error',
							duration: notif.dismissAfter,
							isClosable: false,
							uid: user.uid,
						});
					}
				}
				if (!trainingTestingJobError) {
					// Job update was not due to a training or testing job encountering an error
					doOSNotification({
						title: 'Job Update',
						description: `Finished ${notif.job.job_name} job`,
					});
					toast({
						title: `${notif.job.job_name} Job completed`,
						description: 'Job completed successfully',
						status: 'success',
						duration: notif.dismissAfter,
						isClosable: false,
						uid: user.uid,
					});
				}
			}
			// Update notificationMap
			newNotifMap[notif.job.id] = notif;
		}
		setNotificationMap(newNotifMap);
	}, [notifications, user]);

	return <></>;
});

EngineNotificationsHandlerC.displayName = 'NotificationsHandler';

const mapStateToProps = (state: IAppState) => ({
	notifications: state.notifications.value,
	engineStarted: state.engineStarted,
});

/**
 * Component that manages sending notifications to UI & Native OS
 */
export const EngineNotificationsHandler = connect(mapStateToProps, {
	sendNotification: notifSendAction,
})(EngineNotificationsHandlerC);
