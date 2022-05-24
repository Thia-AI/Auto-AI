import { Box } from '@chakra-ui/react';
import React, { useEffect } from 'react';

/**
 * Component that renders the recent notificatiopns on the dashboard.
 */
export const RecentNotifications = React.memo(() => {
	useEffect(() => {});
	return (
		<Box w='full' h='full' bg='red.300'>
			Yes
		</Box>
	);
});

RecentNotifications.displayName = 'RecentNotifications';
