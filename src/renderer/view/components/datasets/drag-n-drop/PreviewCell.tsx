import React, { useEffect, useState } from 'react';

import { Box, Center, Flex, HStack, Icon, Spacer, Spinner, Text, useToast } from '@chakra-ui/react';
import { promises } from 'fs';
import { areEqual } from 'react-window';
import { extname, parse } from 'path';
import { connect } from 'react-redux';
import { IoTrash } from 'react-icons/io5';

import { IAppState } from '_/renderer/state/reducers';
import { updateDatasetPreviewFilesAction } from '_/renderer/state/dataset-list/DatasetListActionts';
import { IUpdateDatasetPreviewFilesAction } from '_/renderer/state/dataset-list/model/actionTypes';

interface Data {
	rowCount: number;
	directory: string;
}

export interface CellProps {
	style: React.CSSProperties;
	columnIndex: number;
	rowIndex: number;
	data?: Data;
	file_paths: string[];
	updateFiles: (files: string[]) => IUpdateDatasetPreviewFilesAction;
}

const DragNDropPreviewCellC = React.memo((props: CellProps) => {
	// So that we remove the "undefined" from props.data
	if (!props.data) return null;

	const { style, columnIndex, rowIndex, data, file_paths } = props;
	const { rowCount, directory } = data;

	const itemIndex = columnIndex * rowCount + rowIndex;

	if (itemIndex >= file_paths.length) return null;
	// Here on we can assume the file exists
	const toast = useToast();

	const file_path = file_paths[itemIndex];
	const file_name = parse(file_path).name;

	const [imageData, setImageData] = useState('');
	const [isImageLoaded, setImageLoading] = useState(false);

	useEffect(() => {
		const readFileAndLoad = async () => {
			setImageLoading(false);
			try {
				const fileData = await promises.readFile(directory + file_path, {
					encoding: 'base64',
				});
				// Change how to handle the file content
				setImageData(`data:image/${extname(file_path)};base64,${fileData}`);
				setImageLoading(true);
			} catch (err) {
				toast({
					title: 'Error',
					description: `Failed to load '${file_name}'`,
					status: 'error',
					duration: 1050,
					isClosable: false,
				});
			}
		};

		readFileAndLoad();
		return () => {
			setImageData('');
		};
	}, [file_path]);

	const renderLoading = () => {
		return (
			<Center w='full' h='full' boxShadow='lg' bg='gray.700' borderRadius='md'>
				<Spinner />
			</Center>
		);
	};

	const renderPreviewLoaded = () => {
		return (
			<>
				<Flex
					boxShadow='lg'
					w='full'
					h='full'
					flexDir='column'
					bg='gray.700'
					bgImage={imageData}
					borderRadius='md'
					bgSize='cover'
					bgPos='center'>
					<Spacer />
					<HStack
						borderBottomRadius='md'
						// We move it down 1 px and slightly scale or else the corners of the parent background bleed. This is a quick hack!
						// To see what I mean, https://stackoverflow.com/questions/16938437/white-corner-showing-on-black-box-with-border-radius
						transform='translateY(1px) scale(1.01)'
						w='full'
						py='1'
						px='1'
						bg='gray.850'
						fontSize='10px'
						color='gray.300'>
						<Text isTruncated>{file_name}</Text>
						<Spacer />
						<Icon
							fontSize='sm'
							cursor='pointer'
							color='red.400'
							transition='all 200ms'
							willChange='color'
							as={IoTrash}
							_hover={{
								color: 'red.500',
							}}
							onClick={() => {
								const files_cpy = [...file_paths];
								files_cpy.splice(itemIndex, 1);
								props.updateFiles(files_cpy);
							}}
						/>
					</HStack>
				</Flex>
			</>
		);
	};

	const renderPreview = () => {
		if (!isImageLoaded) return renderLoading();
		else return renderPreviewLoaded();
	};

	return (
		<Box p='2' style={style}>
			{renderPreview()}
		</Box>
	);
}, areEqual);

const mapStateToProps = (state: IAppState) => ({
	file_paths: state.datasetPreviewFiles.value,
});

export const DragNDropPreviewCell = connect(mapStateToProps, {
	updateFiles: updateDatasetPreviewFilesAction,
})(DragNDropPreviewCellC);
