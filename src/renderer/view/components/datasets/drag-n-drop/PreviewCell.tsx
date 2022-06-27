import React, { useEffect } from 'react';

import {
	Box,
	Center,
	chakra,
	Flex,
	HStack,
	Icon,
	Spacer,
	Spinner,
	Text,
	useColorModeValue as mode,
} from '@chakra-ui/react';
import { areEqual } from 'react-window';
import { parse } from 'path';
import { connect } from 'react-redux';
import { IoTrash } from 'react-icons/io5';

import { IAppState } from '_/renderer/state/reducers';
import { updateDatasetPreviewFilesAction } from '_/renderer/state/dataset-list/DatasetListActions';
import { IUpdateDatasetPreviewFilesAction } from '_/renderer/state/dataset-list/model/actionTypes';
import { useProgressiveImage } from '_/renderer/view/helpers/hooks/progressiveImage';

interface Data {
	rowCount: number;
	directory: string;
}

/**
 * Properties for a PreviewCell
 */
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
	const spinnerColor = mode('thia.gray.300', 'thia.gray.600');
	const cellBG = mode('thia.gray.100', 'thia.gray.800');
	const cellColor = mode('thia.gray.800', 'thia.gray.300');
	const borderColor = mode('thia.gray.150', 'thia.gray.700');
	const shadow = mode('md', 'md');

	const itemIndex = columnIndex * rowCount + rowIndex;

	if (itemIndex >= file_paths.length) return null;
	// Here on we can assume the file exists

	const file_path = file_paths[itemIndex];
	const file_name = parse(file_path).name;

	const [imageLoaded, imageSrc] = useProgressiveImage(`file://${(directory + file_path).replace(/\\/g, '/')}`);

	// TODO: Add lazy loading of background image
	const renderLoading = () => {
		return (
			<Center w='full' h='full'>
				<Spinner color={spinnerColor} />
			</Center>
		);
	};

	const renderLoaded = () => {
		return (
			<Box p='2' style={style}>
				<Flex
					shadow={shadow}
					w='full'
					h='full'
					flexDir='column'
					bg={cellBG}
					borderWidth='1px'
					borderColor={borderColor}
					borderRadius='sm'
					overflow='hidden'>
					<chakra.img style={{ height: '80%', objectFit: 'cover' }} src={imageSrc} loading='eager' />
					<HStack
						// We move it down 1 px and slightly scale or else the corners of the parent background bleed. This is a quick hack!
						// To see what I mean, https://stackoverflow.com/questions/16938437/white-corner-showing-on-black-box-with-border-radius
						transform='translateY(1px) scale(1.01)'
						w='full'
						h='20%'
						py='1'
						px='1'
						fontSize='10px'
						color={cellColor}>
						<Text noOfLines={1}>{file_name}</Text>
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
			</Box>
		);
	};

	const render = () => {
		if (imageLoaded) {
			return renderLoaded();
		}
		return renderLoading();
	};
	useEffect(() => {}, [file_path]);
	return render();
}, areEqual);

DragNDropPreviewCellC.displayName = 'DragNDropPreviewCell';

const mapStateToProps = (state: IAppState) => ({
	file_paths: state.datasetPreviewFiles.value,
});

/**
 * A card that shows preview of an image (used when uploading images to a dataset).
 */
export const DragNDropPreviewCell = connect(mapStateToProps, {
	updateFiles: updateDatasetPreviewFilesAction,
})(DragNDropPreviewCellC);
