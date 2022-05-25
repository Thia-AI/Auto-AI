import {
	Accordion,
	Box,
	Heading,
	HStack,
	Skeleton,
	Spinner,
	useColorModeValue as mode,
	VStack,
} from '@chakra-ui/react';
import React, { useEffect, useState } from 'react';
import {
	ElectronStoreNotification,
	isElectronStoreNotificationArrayTypeGuard,
} from '_/main/store/notificationsStoreManager';
import { getAllNotifications } from '../../helpers/ipcHelpers';
import { RecentNotification } from './RecentNotification';

/**
 * Component that renders the recent notificatiopns on the dashboard.
 */
export const RecentNotifications = React.memo(() => {
	const [notifications, setNotifications] = useState<ElectronStoreNotification[]>([]);
	const [notificationsLoaded, setNotificationsLoaded] = useState(false);
	const sectionBG = mode('thia.gray.50', 'thia.gray.700');
	const borderColor = mode('thia.gray.200', 'thia.gray.600');

	useEffect(() => {
		const fetchNotifications = async () => {
			const notifications = await getAllNotifications('arraySortedByDate');
			if (isElectronStoreNotificationArrayTypeGuard(notifications)) {
				setNotifications(notifications);
			}
			setNotificationsLoaded(true);
		};

		fetchNotifications();
	}, []);

	useEffect(() => {
		if (notificationsLoaded) {
			console.log(notifications);
		}
	}, [notifications, notificationsLoaded]);

	const renderSpinner = () => {
		if (!notificationsLoaded) {
			return <Spinner size='sm' />;
		}
	};

	return (
		<Box
			w='full'
			h='full'
			rounded='lg'
			borderWidth='1px'
			borderColor={borderColor}
			bg={sectionBG}
			shadow='base'
			px='3'
			py='1.5'>
			<VStack>
				<HStack pt='1.5'>
					<Heading size='md'>Recent Notifications</Heading>
					{renderSpinner()}
				</HStack>
				<Skeleton w='full' h='full' isLoaded={notificationsLoaded}>
					<Accordion allowMultiple allowToggle>
						{notifications.map((notification) => {
							return <RecentNotification key={notification.id} notification={notification} />;
						})}
					</Accordion>
				</Skeleton>
			</VStack>
		</Box>
	);
});

RecentNotifications.displayName = 'RecentNotifications';
