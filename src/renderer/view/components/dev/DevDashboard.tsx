import React, { useState, useEffect, useRef } from 'react';

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
	useColorMode,
	AlertDialog,
	AlertDialogOverlay,
	AlertDialogContent,
	AlertDialogHeader,
	AlertDialogBody,
	Heading,
	AlertDialogCloseButton,
} from '@chakra-ui/react';

import { ipcRenderer } from 'electron';
import { DevDeleteDatasetInputs } from './DevDeleteDatasetInputs';
import {
	IPC_DEV_COPY_ID_TOKEN,
	IPC_DEV_COPY_UID,
	IPC_DEV_TOGGLE_COLOR_MODE,
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
	const closeDashboardButtonRef = useRef(null);
	const { toggleColorMode, colorMode } = useColorMode();
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

		ipcRenderer.on(IPC_DEV_TOGGLE_COLOR_MODE, () => {
			toggleColorMode();
		});

		return () => {
			ipcRenderer.removeAllListeners(IPC_DEV_TOGGLE_DEV_DASHBOARD);
			ipcRenderer.removeAllListeners(IPC_DEV_COPY_ID_TOKEN);
			ipcRenderer.removeAllListeners(IPC_DEV_COPY_UID);
			ipcRenderer.removeAllListeners(IPC_DEV_TOGGLE_COLOR_MODE);
		};
	}, [isDashboardOpen, colorMode]);
	const render = () => {
		return (
			<AlertDialog
				isOpen={isDashboardOpen}
				onClose={() => setIsDashboardOpen(false)}
				isCentered
				blockScrollOnMount
				leastDestructiveRef={closeDashboardButtonRef}
				motionPreset='slideInBottom'
				scrollBehavior='inside'>
				<AlertDialogOverlay />
				<AlertDialogContent minW='80%'>
					<AlertDialogHeader>
						<Heading fontSize='2xl'>Dev Tools</Heading>
						<AlertDialogCloseButton ref={closeDashboardButtonRef} />
					</AlertDialogHeader>
					<AlertDialogBody pb='4' w='full'>
						<VStack w='full' alignItems='flex-start'>
							<Box w='full'>
								<Heading as='h4' fontSize='lg'>
									Delete Dataset Inputs
								</Heading>
								<Text fontSize='sm' mt='1'>
									Given dataset ID, deletes the inputs of a dataset (not the dataset itself)
								</Text>
								<Divider mt='2' />
							</Box>
							<DevDeleteDatasetInputs />
						</VStack>
					</AlertDialogBody>
				</AlertDialogContent>
			</AlertDialog>
		);
	};

	return isDev ? render() : null;
});

DevDashboard.displayName = 'DevDashboard';
