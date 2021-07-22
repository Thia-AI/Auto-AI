import React, { useEffect, useState } from 'react';

import { Center, HStack, Text, Button, VStack, useToast } from '@chakra-ui/react';
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

	const uploadFiles = async (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
		e.preventDefault();
		e.stopPropagation();
		if (files.length !== 0) {
			setImagesUploading(true);
			// Get dataset ID from the path (recall that dataset page has route of /dataset/<dataset-id>)
			const datasetID = pathname.split('/').pop() ?? '';
			const [uploadImageErr, uploadImageRes] =
				await EngineActionHandler.getInstance().uploadImagesToDataset(datasetID, {
					files,
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
		<VStack w='full' alignItems='flex-start'>
			<HStack w='full'>
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

			<DragNDropPreview directory={fileDirectory} />
		</VStack>
	);
});

const mapStateToProps = (state: IAppState) => ({
	files: state.datasetPreviewFiles.value,
	pathname: state.router.location.pathname,
});
export const DragNDrop = connect(mapStateToProps, {
	updateFiles: updateDatasetPreviewFilesAction,
})(DragNDropC);
