import { AccordionButton, AccordionIcon, AccordionItem, AccordionPanel, Box, Text } from '@chakra-ui/react';
import React from 'react';
import { ElectronStoreNotification } from '_/main/store/notificationsStoreManager';

interface Props {
	notification: ElectronStoreNotification;
}
/**
 * Component that renders a single recent notification.
 */
export const RecentNotification = React.memo(({ notification }: Props) => {
	return (
		<AccordionItem w='full'>
			<AccordionButton>
				<Box flex='1' textAlign='left'>
					<Text fontSize='sm' fontWeight='700'>
						{notification.id}
					</Text>
				</Box>
				<AccordionIcon />
			</AccordionButton>
			<AccordionPanel py='2'>
				<Text fontSize='sm' userSelect='text'>
					{notification.description}
				</Text>
			</AccordionPanel>
		</AccordionItem>
	);
});

RecentNotification.displayName = 'RecentNotification';
