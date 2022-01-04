import React from 'react';

import { Box, Flex, HStack, Icon, Spacer, Text } from '@chakra-ui/react';
import { areEqual } from 'react-window';
import { parse } from 'path';
import { connect } from 'react-redux';
import { IoTrash } from 'react-icons/io5';

import { IAppState } from '_/renderer/state/reducers';
import { updateDatasetPreviewFilesAction } from '_/renderer/state/dataset-list/DatasetListActions';
import { IUpdateDatasetPreviewFilesAction } from '_/renderer/state/dataset-list/model/actionTypes';

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

	const itemIndex = columnIndex * rowCount + rowIndex;

	if (itemIndex >= file_paths.length) return null;
	// Here on we can assume the file exists

	const file_path = file_paths[itemIndex];
	const file_name = parse(file_path).name;

	// TODO: Add lazy loading of background image
	// const renderLoading = () => {
	// 	return (
	// 		<Center w='full' h='full' boxShadow='lg' bg='gray.700' borderRadius='md'>
	// 			<Spinner color='gray.600' />
	// 		</Center>
	// 	);
	// };

	return (
		<Box p='2' style={style}>
			<Flex
				boxShadow='lg'
				w='full'
				h='full'
				flexDir='column'
				bg='gray.700'
				bgImage={`url(file://${(directory + file_path).replace(/\\/g, '/')})`}
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
		</Box>
	);
}, areEqual);

const mapStateToProps = (state: IAppState) => ({
	file_paths: state.datasetPreviewFiles.value,
});

/**
 * A card that shows preview of an image (used when uploading images to a dataset).
 */
export const DragNDropPreviewCell = connect(mapStateToProps, {
	updateFiles: updateDatasetPreviewFilesAction,
})(DragNDropPreviewCellC);
