import React, { useEffect, useState } from 'react';

import { Center, HStack, Text, Button, VStack } from '@chakra-ui/react';
import { remote } from 'electron';
import { promises } from 'fs';
import { extname, sep } from 'path';

import { Dataset } from '_/renderer/view/helpers/constants/engineDBTypes';
import { DragNDropPreview } from './DragNDropPreview';
import { connect } from 'react-redux';
import { IAppState } from '_/renderer/state/reducers';
import { updateDatasetPreviewFilesAction } from '_/renderer/state/dataset-list/DatasetListActionts';
import { IUpdateDatasetPreviewFilesAction } from '_/renderer/state/dataset-list/model/actionTypes';

interface Props {
	dataset?: Dataset;
	files: string[];
	updateFiles: (files: string[]) => IUpdateDatasetPreviewFilesAction;
}

const DragNDropC = React.memo((props: Props) => {
	const dialog = remote.dialog;

	const [fileDirectory, setFileDirectory] = useState('');

	useEffect(() => {
		return () => {
			props.updateFiles([]);
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
		props.updateFiles(files.filePaths);
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
			props.updateFiles(filteredFiles);
		} catch (err) {
			console.error(err);
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
					<Button w='full' variant='ghost' colorScheme='green'>
						Upload
					</Button>
					<Button
						w='full'
						variant='outline'
						colorScheme='blue'
						onClick={() => {
							if (props.files.length !== 0) {
								props.updateFiles([]);
							}
						}}>
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
});
export const DragNDrop = connect(mapStateToProps, {
	updateFiles: updateDatasetPreviewFilesAction,
})(DragNDropC);
