import React, { useState, useEffect } from 'react';

import {
	Modal,
	ModalBody,
	ModalContent,
	ModalHeader,
	ModalOverlay,
	Text,
	VStack,
	Box,
	Divider,
	useToast,
} from '@chakra-ui/react';

import { ipcRenderer } from 'electron';
import { DevDeleteDatasetInputs } from './DevDeleteDatasetInputs';
import {
	IPC_DEV_COPY_ID_TOKEN,
	IPC_DEV_COPY_UID,
	IPC_DEV_TOGGLE_DEV_DASHBOARD,
	IPC_RUNTIME_IS_DEV,
} from '_/shared/ipcChannels';
import { useAuth } from 'reactfire';

/**
 * Dev panel (only works during development).
 */
export const DevDashboard = React.memo(() => {
	const [isDashboardOpen, setIsDashboardOpen] = useState(false);
	const auth = useAuth();
	const toast = useToast();

	const [isDev, setIsDev] = useState(false);

	useEffect(() => {
		const setupDev = async () => {
			setIsDev(await ipcRenderer.invoke(IPC_RUNTIME_IS_DEV));
		};

		setupDev();
	}, []);

	useEffect(() => {
		ipcRenderer.on(IPC_DEV_TOGGLE_DEV_DASHBOARD, () => {
			isDashboardOpen ? setIsDashboardOpen(false) : setIsDashboardOpen(true);
		});

		ipcRenderer.on(IPC_DEV_COPY_ID_TOKEN, async () => {
			if (auth.currentUser) {
				const idToken = await auth.currentUser.getIdToken(false);

				navigator.clipboard.writeText(idToken);
				toast({
					title: 'Success',
					description: 'User ID Token Copied',
					status: 'success',
					duration: 1000,
					isClosable: false,
				});
			} else {
				toast({
					title: 'Warning',
					description: 'No User',
					status: 'warning',
					duration: 1000,
					isClosable: false,
				});
			}
		});

		ipcRenderer.on(IPC_DEV_COPY_UID, async () => {
			if (auth.currentUser) {
				const uid = await auth.currentUser.uid;

				navigator.clipboard.writeText(uid);
				toast({
					title: 'Success',
					description: 'User UID Copied',
					status: 'success',
					duration: 1000,
					isClosable: false,
				});
			} else {
				toast({
					title: 'Warning',
					description: 'No User',
					status: 'warning',
					duration: 1000,
					isClosable: false,
				});
			}
		});

		return () => {
			ipcRenderer.removeAllListeners(IPC_DEV_TOGGLE_DEV_DASHBOARD);
			ipcRenderer.removeAllListeners(IPC_DEV_COPY_ID_TOKEN);
			ipcRenderer.removeAllListeners(IPC_DEV_COPY_UID);
		};
	}, [isDashboardOpen]);
	const render = () => {
		return (
			<Modal
				isOpen={isDashboardOpen}
				onClose={() => setIsDashboardOpen(false)}
				isCentered
				blockScrollOnMount
				motionPreset='slideInBottom'
				scrollBehavior='inside'>
				<ModalOverlay />
				<ModalContent minW='80%'>
					<ModalHeader>Dev Tools</ModalHeader>
					<ModalBody pb='4' w='full'>
						<VStack w='full' alignItems='flex-start'>
							<Box w='full'>
								<Text as='h3' fontWeight='bold' fontSize='lg'>
									Delete Dataset Inputs
								</Text>
								<Text fontSize='sm' mt='1' color='gray.200'>
									Given dataset ID, deletes the inputs of a dataset (not the dataset itself)
								</Text>
								<Divider mt='2' />
							</Box>

							<DevDeleteDatasetInputs />
						</VStack>
					</ModalBody>
				</ModalContent>
			</Modal>
		);
	};

	return isDev ? render() : null;
});

DevDashboard.displayName = 'DevDashboard';
