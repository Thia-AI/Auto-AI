import { ipcRenderer } from 'electron';
import React, { useEffect, useRef, useState } from 'react';
import {
	AlertDialog,
	AlertDialogBody,
	AlertDialogContent,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogOverlay,
	Badge,
	Button,
	HStack,
	Icon,
	Text,
	Spinner,
	useDisclosure,
	Box,
	Center,
	Progress,
	Spacer,
} from '@chakra-ui/react';
import {
	IPC_AUTO_UPDATE_CHECK,
	IPC_AUTO_UPDATE_DOWNLOAD_CANCELLED,
	IPC_AUTO_UPDATE_DOWNLOAD_PROGRESS_INFO,
	IPC_AUTO_UPDATE_ERROR,
	IPC_AUTO_UPDATE_INSTALL_UPDATE,
	IPC_GET_APP_VERSION,
	IPC_INFORM_UPDATE_AVAILABLE,
	IPC_INFORM_UPDATE_NOT_AVAILABLE,
} from '_/shared/ipcChannels';
import { MdUpdate } from 'react-icons/md';
import ReactTooltip from 'react-tooltip';
import { ProgressInfo } from 'electron-updater';
import { formatBytesToString } from '../../helpers/textHelper';
import { toast } from '../../helpers/functionHelpers';
import { useUser } from 'reactfire';

interface AutoUpdateError {
	cause: unknown;
	name: string;
	message: string;
	stack?: string;
}

/**
 * Component that renders auto update.
 */
export const UpdateIndicator = React.memo(() => {
	const [updateChecked, setUpdateChecked] = useState(false);
	const [updateAvailable, setUpdateAvailable] = useState(false);
	const [appVersion, setAppVersion] = useState<number>();
	const [downloadProgressInfo, setDownloadProgressInfo] = useState<ProgressInfo>();
	const [startedDownload, setStartedDownload] = useState(false);
	const [latestAppVersion, setLatestAppVersion] = useState<number>();
	const { data: user } = useUser();

	const { isOpen: isUpdateDialogOpen, onOpen: openUpdateDialog, onClose: closeUpdateDialog } = useDisclosure();
	const cancelUpdateDownloadButtonRef = useRef(null);

	useEffect(() => {
		getAppVersion();
		checkForUpdate();
		updateResultInitialize();
	}, []);

	const checkForUpdate = async () => {
		setUpdateChecked(false);
		await ipcRenderer.invoke(IPC_AUTO_UPDATE_CHECK);
	};

	const getAppVersion = async () => {
		const appVersion = await ipcRenderer.invoke(IPC_GET_APP_VERSION);
		setAppVersion(appVersion);
	};

	const updateResultInitialize = () => {
		ipcRenderer.on(IPC_INFORM_UPDATE_NOT_AVAILABLE, (_, latestUpdateVersion: number) => {
			setLatestAppVersion(latestUpdateVersion);
			setUpdateChecked(true);
		});

		ipcRenderer.on(IPC_INFORM_UPDATE_AVAILABLE, (_, latestUpdateVersion) => {
			setLatestAppVersion(latestUpdateVersion);
			setUpdateChecked(true);
			setUpdateAvailable(true);
		});

		ipcRenderer.on(IPC_AUTO_UPDATE_DOWNLOAD_PROGRESS_INFO, (_, progressInfo: ProgressInfo) => {
			setDownloadProgressInfo(progressInfo);
		});

		ipcRenderer.on(IPC_AUTO_UPDATE_DOWNLOAD_CANCELLED, async () => {
			await resetDownloadState();
			if (user) {
				toast({
					title: 'Update Cancelled',
					description: 'Please try again later',
					status: 'error',
					duration: 3500,
					isClosable: false,
					uid: user.uid,
				});
			}
		});

		ipcRenderer.on(IPC_AUTO_UPDATE_ERROR, async (_, error: AutoUpdateError) => {
			await resetDownloadState();
			if (user) {
				toast({
					title: 'Error Occurred When Updating',
					description: error.message,
					status: 'error',
					duration: 3500,
					isClosable: false,
					uid: user.uid,
				});
			}
		});
	};

	const resetDownloadState = async () => {
		setDownloadProgressInfo(undefined);
		setLatestAppVersion(undefined);
		setStartedDownload(false);
		await checkForUpdate();
	};

	const downloadUpdate = async () => {
		setStartedDownload(true);
		await ipcRenderer.invoke(IPC_AUTO_UPDATE_INSTALL_UPDATE);
	};

	const renderIcon = () => {
		if (updateChecked) {
			if (updateAvailable) {
				return (
					<>
						<Center
							data-tip
							cursor='pointer'
							color='thia.gray.100'
							data-for='updateTooltip'
							onClick={openUpdateDialog}
							_hover={{ transform: 'scale(1.15)', color: 'thia.purple.400' }}
							transition='all 150ms'>
							<Icon css={{ '-webkit-app-region': 'no-drag' }} w='16px' h='16px' as={MdUpdate} />
						</Center>

						<ReactTooltip id='updateTooltip' className='tooltip' place='bottom' globalEventOff='mouseout'>
							<Box as='span'>Update Available</Box>
						</ReactTooltip>
					</>
				);
			}
		} else {
			return <Spinner size='sm' color='thia.gray.100' />;
		}
	};

	const renderDownloadProgress = () => {
		if (downloadProgressInfo) {
			return (
				<Box mt='4'>
					<HStack mb='1' px='0.5'>
						<Text fontSize='xs'>{formatBytesToString(downloadProgressInfo.delta)}/s</Text>
						<Spacer />
						<Text fontSize='xs'>
							{formatBytesToString(downloadProgressInfo.transferred)} /{' '}
							{formatBytesToString(downloadProgressInfo.total)} ({downloadProgressInfo.percent.toFixed(1)}
							%)
						</Text>
					</HStack>
					<Progress
						colorScheme='thia.purple'
						size='xs'
						max={downloadProgressInfo.total}
						value={downloadProgressInfo.transferred}
					/>
				</Box>
			);
		}
	};

	const renderAlertDialog = () => {
		return (
			<AlertDialog
				isCentered
				isOpen={isUpdateDialogOpen}
				leastDestructiveRef={cancelUpdateDownloadButtonRef}
				closeOnOverlayClick={!startedDownload}
				closeOnEsc={!startedDownload}
				onClose={() => {
					if (!startedDownload) closeUpdateDialog();
				}}>
				<AlertDialogOverlay>
					<AlertDialogContent>
						<AlertDialogHeader>
							<HStack justify='space-between' alignItems='center'>
								<Badge ml='0.5' fontSize='sm' colorScheme='thia.purple'>
									Update Available
								</Badge>
								<Text fontSize='11px'>
									{appVersion} -&gt; {latestAppVersion}
								</Text>
							</HStack>
						</AlertDialogHeader>

						<AlertDialogBody>
							<Text fontSize='sm'>
								Cancel all processes beforehand or wait till they are complete before updating.
							</Text>
							{renderDownloadProgress()}
						</AlertDialogBody>

						<AlertDialogFooter>
							<Button
								variant='ghost'
								ref={cancelUpdateDownloadButtonRef}
								onClick={() => {
									if (!startedDownload) closeUpdateDialog();
								}}>
								Cancel
							</Button>
							<Button
								colorScheme='thia.purple'
								ml='3'
								isLoading={startedDownload}
								onClick={downloadUpdate}>
								Install
							</Button>
						</AlertDialogFooter>
					</AlertDialogContent>
				</AlertDialogOverlay>
			</AlertDialog>
		);
	};

	return (
		<>
			{renderAlertDialog()}
			{renderIcon()}
		</>
	);
});

UpdateIndicator.displayName = 'UpdateIndicator';
