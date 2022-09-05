import {
	AlertDialog,
	AlertDialogBody,
	AlertDialogContent,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogOverlay,
	Button,
	Text,
	Flex,
	IconButton,
	useColorModeValue as mode,
	useDisclosure,
	VStack,
	Link,
	Center,
	chakra,
	HStack,
	Spacer,
	Icon,
	Progress,
} from '@chakra-ui/react';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { ErrorCode, FileRejection, useDropzone } from 'react-dropzone';
import { FiUpload } from 'react-icons/fi';
import { IoCloseOutline, IoRefresh } from 'react-icons/io5';
import { connect } from 'react-redux';
import { useUser } from 'reactfire';
import { EngineRequestHandler } from '_/renderer/engine-requests/engineRequestHandler';
import { getNextPageInputsAction } from '_/renderer/state/active-dataset-inputs/ActiveDatasetInputsActions';
import { changeActiveDataset, datasetFetchingAction } from '_/renderer/state/active-dataset-page/ActiveDatasetActions';
import {
	IChangeActiveDatasetAction,
	IDatasetFetchingAction,
} from '_/renderer/state/active-dataset-page/model/actionTypes';
import {
	IActiveDatasetReducer,
	IDatasetFetchingReducer,
} from '_/renderer/state/active-dataset-page/model/reducerTypes';
import { IAppState } from '_/renderer/state/reducers';
import { LEARN_MORE_BATCH_LABELLING } from '_/renderer/view/helpers/constants/documentationConstants';
import { Dataset, Job, Labels } from '_/renderer/view/helpers/constants/engineTypes';
import { toast } from '_/renderer/view/helpers/functionHelpers';
import { formatBytesToString } from '_/renderer/view/helpers/textHelper';

interface Props {
	activeDataset: IActiveDatasetReducer;
	datasetFetching: IDatasetFetchingReducer;
	setDatasetFetching: (value: boolean) => IDatasetFetchingAction;
	changeActiveDataset: (activeDataset: Dataset, labels: Labels) => IChangeActiveDatasetAction;
	getNextPageInputs: (datasetID: string, cursorDate: string) => void;
}
const DatasetPreviewSettingsC = React.memo(
	({ activeDataset, changeActiveDataset, getNextPageInputs, datasetFetching, setDatasetFetching }: Props) => {
		const { dataset } = activeDataset.value;
		const batchLabelJobIntervalRetrievalTimeMS = 3_000;

		const inputColor = mode('thia.gray.700', 'thia.gray.500');
		const fileInformationBG = mode('thia.gray.50', 'thia.gray.700');
		const borderColor = mode('thia.gray.200', 'thia.gray.700');

		const [batchLabelJob, setBatchLabelJob] = useState<Job>();
		const [selectedLabelFile, setSelectedLabelFile] = useState<File | null>(null);
		const [rejectedLabelFiles, setRejectedLabelFiles] = useState<FileRejection[]>([]);
		const [uploadingLabelFile, setUploadingLabelFile] = useState(false);
		const [batchLabelJobIntervalID, setBatchLabelJobIntervalID] = useState<number>();
		const [_, _s] = useState(false);

		const cancelUploadLabelsButtonRef = useRef(null);

		const { data: user } = useUser();

		const {
			isOpen: isUploadLabelsDialogOpen,
			onClose: onCloseUploadLabelsDialog,
			onOpen: openUploadLabelsDialog,
		} = useDisclosure();

		const closeUploadLabelsDialog = () => {
			onCloseUploadLabelsDialog();
			setRejectedLabelFiles([]);
			setSelectedLabelFile(null);
		};

		const refreshDatasetAndInputs = async () => {
			if (dataset.id.length === 0) return;
			setDatasetFetching(true);
			const [datasetError, datasetResData] = await EngineRequestHandler.getInstance().getDataset(dataset.id);
			const [datasetLabelsError, datasetLabelsResData] =
				await EngineRequestHandler.getInstance().getDatasetLabels(dataset.id);
			if (!datasetError && !datasetLabelsError) {
				changeActiveDataset(datasetResData, datasetLabelsResData);
			}
			// Refresh dataset page inputs
			// Get next pages from oldest date possible.
			const someOldDateBase64 = Buffer.from(new Date(0).toLocaleString()).toString('base64');
			getNextPageInputs(activeDataset.value.dataset.id, someOldDateBase64);
			setDatasetFetching(false);
		};

		const onDrop = useCallback((acceptedFiles: File[], rejected: FileRejection[]) => {
			if (acceptedFiles.length === 1) {
				setSelectedLabelFile(acceptedFiles[0]);
			}
			setRejectedLabelFiles(rejected);
		}, []);

		const { getRootProps, getInputProps, isDragActive, isDragReject, draggedFiles } = useDropzone({
			onDrop,
			accept: ['application/json'],
			multiple: false,
			maxFiles: 1,
		});

		// Rejected file error informing
		useEffect(() => {
			if (rejectedLabelFiles.length > 0 && user) {
				if (rejectedLabelFiles[0].errors[0].code == ErrorCode.FileInvalidType) {
					// Invalid file type
					toast({
						title: 'Error',
						description: 'Can only select a JSON file',
						status: 'error',
						duration: 1500,
						isClosable: false,
						uid: user.uid,
						saveToStore: false,
					});
				} else if (rejectedLabelFiles[0].errors[0].code == ErrorCode.TooManyFiles) {
					// Too many files selected
					toast({
						title: 'Error',
						description: 'Cannot select more than 1 label file',
						status: 'error',
						duration: 1500,
						isClosable: false,
						uid: user.uid,
						saveToStore: false,
					});
				}
				// Reset
				setRejectedLabelFiles([]);
			}
		}, [rejectedLabelFiles, user]);

		// Clear interval when unmounting
		useEffect(() => {
			return () => {
				if (batchLabelJobIntervalID) {
					clearInterval(batchLabelJobIntervalID);
					setBatchLabelJobIntervalID(undefined);
				}
			};
		}, [batchLabelJobIntervalID]);

		// Clear interval when batchLabel job has completed
		useEffect(() => {
			const onBatchLabelJobCompleted = async () => {
				if (batchLabelJob && batchLabelJob.has_finished) {
					if (batchLabelJobIntervalID) clearInterval(batchLabelJobIntervalID);
					setUploadingLabelFile(false);
					setBatchLabelJob(undefined);
					closeUploadLabelsDialog();
					await refreshDatasetAndInputs();
				}
			};
			onBatchLabelJobCompleted();
		}, [batchLabelJob]);

		const fetchBatchLabelJob = async (batchLabelJobID: string) => {
			const [error, resData] = await EngineRequestHandler.getInstance().getJob(batchLabelJobID);
			if (!error) {
				setBatchLabelJob(resData);
			}
		};

		const refreshBatchLabelJob = async (batchLabelJobID: string) => {
			if (!batchLabelJobIntervalID) {
				const intervalID = window.setInterval(
					fetchBatchLabelJob,
					batchLabelJobIntervalRetrievalTimeMS,
					batchLabelJobID,
				);
				setBatchLabelJobIntervalID(intervalID);
			}
		};

		const uploadLabelsFile = async () => {
			if (selectedLabelFile && dataset.id.length > 0 && user) {
				const formData = new FormData();
				formData.append('file', selectedLabelFile);
				const [batchLabelError, batchLabelResData] =
					await EngineRequestHandler.getInstance().updateMultipleLabels(dataset.id, formData);
				if (batchLabelError) {
					toast({
						title: 'Failed to upload labels file',
						description: batchLabelResData['Error'] ?? '',
						status: 'error',
						duration: 2500,
						isClosable: false,
						uid: user.uid,
					});
					return;
				}
				setUploadingLabelFile(true);
				toast({
					title: 'Warning',
					description:
						'This may take a few minutes to complete depending on the amount of image labels being updated',
					status: 'warning',
					duration: 5000,
					isClosable: true,
					uid: user.uid,
					saveToStore: false,
				});
				const batchLabelJobID: string = batchLabelResData['ids'][0];
				refreshBatchLabelJob(batchLabelJobID);
			}
		};

		const renderLabelFileInformation = () => {
			if (selectedLabelFile) {
				return (
					<HStack
						bg={fileInformationBG}
						rounded='md'
						w='full'
						px='2'
						py='1'
						borderColor={borderColor}
						borderWidth='1px'>
						<Text noOfLines={1}>{selectedLabelFile.name}</Text>
						<Spacer />
						<HStack>
							<Text>{formatBytesToString(selectedLabelFile.size)}</Text>
							<Icon
								fontSize='lg'
								cursor='pointer'
								color='red.400'
								transition='all 200ms'
								title='Remove File'
								aria-label='Remove File'
								as={IoCloseOutline}
								_hover={{
									color: 'red.500',
									transform: 'scale(1.10)',
								}}
								onClick={() => {
									setSelectedLabelFile(null);
								}}
							/>
						</HStack>
					</HStack>
				);
			}
		};

		const renderDragText = () => {
			let text = 'Drop Label File Or Click To Select';
			let error = false;
			if (isDragActive) {
				if (isDragReject && draggedFiles.length > 1) {
					text = 'Can Only Drag 1 Label File';
					error = true;
				} else {
					text = 'Drop Label File Here...';
				}
			}
			return (
				<Text color={error ? 'red.400' : inputColor} opacity={error ? 0.8 : 1}>
					{text}
				</Text>
			);
		};

		const renderBatchLabelJobProgress = () => {
			if (uploadingLabelFile) {
				return (
					<Progress
						w='full'
						size='xs'
						colorScheme='thia.purple'
						max={batchLabelJob?.progress_max ?? 100}
						value={batchLabelJob?.progress ?? 0}
					/>
				);
			}
		};
		return (
			<>
				<Flex w='full' justify='flex-end' p='2'>
					<IconButton
						aria-label='Refresh Dataset'
						title='Refresh Dataset'
						icon={<IoRefresh />}
						mr='2'
						variant='ghost'
						colorScheme='thia.gray'
						isLoading={datasetFetching.value}
						onClick={async () => await refreshDatasetAndInputs()}
					/>
					<IconButton
						aria-label='Dataset Batch Labelling'
						title='Dataset Batch Labelling'
						icon={<FiUpload />}
						variant='ghost'
						colorScheme='thia.gray'
						isLoading={datasetFetching.value}
						onClick={() => openUploadLabelsDialog()}
					/>
				</Flex>

				<AlertDialog
					isOpen={isUploadLabelsDialogOpen}
					onClose={closeUploadLabelsDialog}
					isCentered
					blockScrollOnMount
					closeOnEsc={!uploadingLabelFile}
					closeOnOverlayClick={!uploadingLabelFile}
					leastDestructiveRef={cancelUploadLabelsButtonRef}
					motionPreset='slideInBottom'
					scrollBehavior='inside'>
					<AlertDialogOverlay />
					<AlertDialogContent w='80vw'>
						<AlertDialogHeader>Batch Labelling</AlertDialogHeader>
						<AlertDialogBody pb='4'>
							<VStack w='full' alignItems='flex-start' spacing='6'>
								<Text fontSize='15px'>
									When labelling a dataset, it is tedious to do so for each image manually. To make
									labelling quicker, upload a labels JSON file to quickly label your entire dataset.
								</Text>

								<Link fontSize='sm' href={LEARN_MORE_BATCH_LABELLING}>
									Learn more about the format of the file here
								</Link>
								{renderLabelFileInformation()}
								{renderBatchLabelJobProgress()}
								<Center
									w='full'
									flex='1 1 auto'
									willChange='border-color'
									py='6'
									_hover={{
										borderColor: 'thia.purple.400',
									}}
									cursor='pointer'
									border='2px dashed'
									borderRadius='md'
									transition='all 250ms ease'
									outline='none'
									borderColor={
										isDragReject && draggedFiles.length > 1
											? 'red.400'
											: isDragActive
											? 'green.400'
											: inputColor
									}
									overflow='hidden'
									color={mode('thia.dark.700', 'thia.dark.500')}
									{...getRootProps()}>
									<chakra.input {...getInputProps()} />
									{renderDragText()}
								</Center>
							</VStack>
						</AlertDialogBody>
						<AlertDialogFooter>
							<Button
								ref={cancelUploadLabelsButtonRef}
								variant='ghost'
								mr='4'
								isDisabled={uploadingLabelFile}
								colorScheme='thia.gray'
								onClick={() => closeUploadLabelsDialog()}>
								Cancel
							</Button>
							<Button
								colorScheme='thia.purple'
								onClick={uploadLabelsFile}
								isLoading={uploadingLabelFile}
								loadingText='Applying Update'>
								Upload
							</Button>
						</AlertDialogFooter>
					</AlertDialogContent>
				</AlertDialog>
			</>
		);
	},
);

DatasetPreviewSettingsC.displayName = 'DatasetPreviewSettings';

const mapStateToProps = (state: IAppState) => ({
	activeDataset: state.activeDataset,
	datasetFetching: state.datasetFetching,
});

/**
 * Component that renders settings for a dataset preview.
 */
export const DatasetPreviewSettings = connect(mapStateToProps, {
	changeActiveDataset,
	getNextPageInputs: getNextPageInputsAction,
	setDatasetFetching: datasetFetchingAction,
})(DatasetPreviewSettingsC);
