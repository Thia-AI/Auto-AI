import React, { useEffect, useState } from 'react';

import { Center, HStack, Text, Button, VStack, useToast, Flex } from '@chakra-ui/react';
import { remote } from 'electron';
import { promises } from 'fs';
import { extname, sep } from 'path';

import { DragNDropPreview } from './DragNDropPreview';
import { connect } from 'react-redux';
import { IAppState } from '_/renderer/state/reducers';
import { updateDatasetPreviewFilesAction } from '_/renderer/state/dataset-list/DatasetListActions';
import { IUpdateDatasetPreviewFilesAction } from '_/renderer/state/dataset-list/model/actionTypes';
import { JobMonitorHandler } from '_/renderer/view/worker-handlers/JobMonitorHandler';
import { EngineActionHandler } from '_/renderer/engine-requests/engineActionHandler';
import { JobProgress } from '../../notifications/JobProgress';
import { Job, nullJob } from '_/renderer/view/helpers/constants/engineDBTypes';

interface Props {
	files: string[];
	updateFiles: (files: string[]) => IUpdateDatasetPreviewFilesAction;
	pathname: string;
}

const DragNDropC = React.memo(({ files, updateFiles, pathname }: Props) => {
	const toast = useToast();

	const dialog = remote.dialog;

	const [fileDirectory, setFileDirectory] = useState('');
	const [imagesUploading, setImagesUploading] = useState(false);

	const [uploadJobID, setUploadJobID] = useState<string | undefined>(undefined);

	const [uploadJob, setUploadJob] = useState<Job>(nullJob);

	useEffect(() => {
		return () => {
			updateFiles([]);
		};
	}, []);

	const selectMultipleFiles = async (e: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
		e.preventDefault();
		const files = await dialog.showOpenDialog(remote.getCurrentWindow(), {
			title: 'Select Files to Upload',
			properties: ['openFile', 'multiSelections', 'dontAddToRecent'],
			filters: [
				{
					name: 'Images',
					extensions: ['jpg', 'png', 'jpeg'],
				},
			],
		});
		if (files.canceled) return;
		setFileDirectory('');
		updateFiles(files.filePaths);
	};

	const selectFolder = async (e: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
		e.preventDefault();
		const folder = await dialog.showOpenDialog(remote.getCurrentWindow(), {
			title: 'Select Folder to Upload',
			properties: ['openDirectory', 'dontAddToRecent'],
		});
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
	 * Uploads files to dataset
	 * @param e Button click event
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
			const [uploadImageErr, uploadImageRes] =
				await EngineActionHandler.getInstance().uploadImagesToDataset(datasetID, {
					files: filesCpy,
				});
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
			const [err, resData] = await EngineActionHandler.getInstance().getJob(
				uploadImageRes['ids'][0],
			);
			if (!err) {
				setUploadJob(resData as Job);
				console.log(resData);
			}

			setUploadJobID(uploadImageRes['ids'][0]);
			JobMonitorHandler.getInstance().addJobIDToMonitor(uploadImageRes['ids'][0]);

			setImagesUploading(false);
			toast({
				title: 'Success',
				description: 'Started Image Upload Job',
				status: 'info',
				duration: 1500,
				isClosable: false,
			});
			updateFiles([]);
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
		</Flex>
	);
});

const mapStateToProps = (state: IAppState) => ({
	files: state.datasetPreviewFiles.value,
	pathname: state.router.location.pathname,
});

/**
 * Component to drag and drop images to upload to a Engine dataset
 */

export const DragNDrop = connect(mapStateToProps, {
	updateFiles: updateDatasetPreviewFilesAction,
})(DragNDropC);
