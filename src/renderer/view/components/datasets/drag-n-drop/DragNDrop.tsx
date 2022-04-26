import React, { useEffect, useState } from 'react';

import { Center, HStack, Text, Button, VStack, useToast, Flex } from '@chakra-ui/react';
import { promises } from 'fs';
import { extname, sep } from 'path';
import { ipcRenderer, OpenDialogReturnValue } from 'electron';

import { DragNDropPreview } from './DragNDropPreview';
import { connect } from 'react-redux';
import { IAppState } from '_/renderer/state/reducers';
import { updateDatasetPreviewFilesAction } from '_/renderer/state/dataset-list/DatasetListActions';
import { IUpdateDatasetPreviewFilesAction } from '_/renderer/state/dataset-list/model/actionTypes';
import { EngineActionHandler } from '_/renderer/engine-requests/engineActionHandler';
import { JobProgress } from '../../notifications/JobProgress';
import { Job, nullJob } from '_/renderer/view/helpers/constants/engineDBTypes';
import { DatasetLabelInputPreview } from '../preview/DatasetLabelInputPreview';
import { IPC_DRAG_AND_DROP_SELECT_FOLDER, IPC_DRAG_AND_DROP_SELECT_MULTIPLE_FILES } from '_/shared/ipcChannels';
import { getNextPageInputsAction } from '_/renderer/state/active-dataset-inputs/ActiveDatasetInputsActions';
import { IActiveDatasetInputsReducer } from '_/renderer/state/active-dataset-inputs/model/reducerTypes';
import { MAX_INPUTS_PER_PAGE } from '_/shared/engineConstants';
import { sleep } from '_/renderer/view/helpers/functionHelpers';

interface Props {
	files: string[];
	updateFiles: (files: string[]) => IUpdateDatasetPreviewFilesAction;
	pathname: string;
	getNextPageInputs: (datasetID: string, cursorDate: string) => void;
	activeDatasetInputs: IActiveDatasetInputsReducer;
	refreshDataset: () => Promise<void>;
}

const DragNDropC = React.memo(
	({ files, updateFiles, pathname, getNextPageInputs, activeDatasetInputs, refreshDataset }: Props) => {
		const toast = useToast();

		const [fileDirectory, setFileDirectory] = useState('');
		const [imagesUploading, setImagesUploading] = useState(false);

		const [uploadJobID, setUploadJobID] = useState<string | undefined>(undefined);

		const [uploadJob, setUploadJob] = useState<Job>(nullJob);

		useEffect(() => {
			return () => {
				updateFiles([]);
			};
		}, []);

		/**
		 * Opens native OS dialog with multiple file selection (Images only).
		 *
		 * @param e Button click event.
		 */
		const selectMultipleFiles = async (e: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
			e.preventDefault();
			const files: OpenDialogReturnValue = await ipcRenderer.invoke(IPC_DRAG_AND_DROP_SELECT_MULTIPLE_FILES);
			if (files.canceled) return;
			setFileDirectory('');
			updateFiles(files.filePaths);
		};

		/**
		 * Opens native OS dialog with folder selection.
		 *
		 * @param e Button click event.
		 */
		const selectFolder = async (e: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
			e.preventDefault();
			const folder: OpenDialogReturnValue = await ipcRenderer.invoke(
				IPC_DRAG_AND_DROP_SELECT_FOLDER,
				'Select Folder to Upload',
			);

			if (folder.canceled) return;
			try {
				const files = await promises.readdir(folder.filePaths[0]);
				const filteredFiles = files.filter((file) => {
					const extension = extname(file).toLowerCase();
					return extension === '.jpg' || extension === '.jpeg' || extension === '.png';
				});
				setFileDirectory(folder.filePaths[0] + sep);
				updateFiles(filteredFiles);
			} catch (err) {
				console.error(err);
			}
		};

		/**
		 * Uploads files to dataset.
		 *
		 * @param e Button click event.
		 */
		const uploadFiles = async (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
			e.preventDefault();
			e.stopPropagation();
			if (files.length !== 0) {
				setImagesUploading(true);
				// Create copy of files with directory path appended
				const filesCpy: string[] = [];
				for (let i = 0; i < files.length; i++) {
					filesCpy.push(fileDirectory + files[i]);
				}
				// Get dataset ID from the path (recall that dataset page has route of /dataset/<dataset-id>)
				const datasetID = pathname.split('/').pop() ?? '';
				const [uploadImageErr, uploadImageRes] = await EngineActionHandler.getInstance().uploadImagesToDataset(
					datasetID,
					{
						files: filesCpy,
					},
				);
				if (uploadImageErr) {
					toast({
						title: 'Error',
						description: 'Failed to upload images to dataset',
						status: 'error',
						duration: 1500,
						isClosable: true,
					});
					setImagesUploading(false);
					return;
				}
				// Get initial job that is passed down to the JobProgress component
				const [err, resData] = await EngineActionHandler.getInstance().getJob(uploadImageRes['ids'][0]);
				if (!err) {
					setUploadJob(resData as Job);
				}
				setUploadJobID(uploadImageRes['ids'][0]);

				setImagesUploading(false);
				toast({
					title: 'Success',
					description: 'Started Image Upload Job',
					status: 'info',
					duration: 1500,
					isClosable: false,
				});
				await refreshDataset();
				updateFiles([]);
				await sleep(300);
				if (activeDatasetInputs.value.length < MAX_INPUTS_PER_PAGE) {
					// Reset active dataset inputs for previewing.
					const someOldDateBase64 = Buffer.from(new Date(0).toLocaleString()).toString('base64');
					getNextPageInputs(datasetID, someOldDateBase64);
				}
			}
		};

		const clearFiles = (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
			e.preventDefault();
			e.stopPropagation();

			if (files.length !== 0) {
				updateFiles([]);
			}
		};

		return (
			<Flex w='full' alignItems='flex-start' flexDir='column'>
				<HStack w='full' mb='2'>
					<Center
						w='full'
						willChange='border-color'
						py='8'
						_hover={{
							borderColor: 'green.500',
						}}
						cursor='pointer'
						border='2px dashed'
						borderRadius='md'
						transition='all 250ms ease'
						outline='none'
						borderColor='gray.500'
						overflow='hidden'
						color='gray.600'
						onClick={selectMultipleFiles}>
						<Text fontSize='md' isTruncated>
							Select *.png or *.jpg images
						</Text>
					</Center>
					<Center
						w='full'
						willChange='border-color'
						py='8'
						_hover={{
							borderColor: 'green.500',
						}}
						cursor='pointer'
						border='2px dashed'
						borderRadius='md'
						transition='all 250ms ease'
						outline='none'
						borderColor='gray.500'
						overflow='hidden'
						color='gray.600'
						onClick={selectFolder}>
						<Text fontSize='md'>Select folder containing images (faster)</Text>
					</Center>
					<VStack ml='2'>
						<Button
							isLoading={imagesUploading}
							w='full'
							variant='ghost'
							colorScheme='green'
							onClick={uploadFiles}>
							Upload
						</Button>
						<Button w='full' variant='outline' colorScheme='blue' onClick={clearFiles}>
							Clear
						</Button>
					</VStack>
				</HStack>
				<JobProgress
					jobID={uploadJobID}
					initialJob={uploadJob}
					clearJobIDState={() => setUploadJobID(undefined)}
				/>
				<DragNDropPreview directory={fileDirectory} />
				<DatasetLabelInputPreview />
			</Flex>
		);
	},
);

DragNDropC.displayName = 'DragNDrop';

const mapStateToProps = (state: IAppState) => ({
	files: state.datasetPreviewFiles.value,
	pathname: state.router.location.pathname,
	activeDatasetInputs: state.activeDatasetInputs,
});

/**
 * Component to drag and drop images to upload to a Engine dataset.
 */
export const DragNDrop = connect(mapStateToProps, {
	updateFiles: updateDatasetPreviewFilesAction,
	getNextPageInputs: getNextPageInputsAction,
})(DragNDropC);
