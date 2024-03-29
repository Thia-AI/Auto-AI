import { Button, Center, Flex, HStack, Icon, LayoutProps, Text, useColorModeValue as mode } from '@chakra-ui/react';
import React, { useCallback, useEffect } from 'react';
import { connect } from 'react-redux';
import { GrFormPrevious, GrFormNext } from 'react-icons/gr';

import {
	IActiveDatasetInputsPreviewIDReducer,
	IActiveDatasetInputsReducer,
	INextPageCursorReducer,
	IPreviousPageCursorReducer,
} from '_/renderer/state/active-dataset-inputs/model/reducerTypes';
import { IAppState } from '_/renderer/state/reducers';
import { PaginationCell } from './PaginationCell';
import {
	getNextPageInputsAction,
	getPreviousPageInputsAction,
	setActiveDatasetInputsPreviewIDAction,
} from '_/renderer/state/active-dataset-inputs/ActiveDatasetInputsActions';
import { IActiveDatasetReducer } from '_/renderer/state/active-dataset-page/model/reducerTypes';
import { ISetActiveDatasetInputsPreviewIDAction } from '_/renderer/state/active-dataset-inputs/model/actionTypes';
import { MdImageNotSupported } from 'react-icons/md';
import { useHorizontalScrollbar } from '_/renderer/view/helpers/hooks/scrollbar';
interface Props {
	h: LayoutProps['h'];
	activeDatasetInputs: IActiveDatasetInputsReducer;
	nextPageCursor: INextPageCursorReducer;
	previousPageCursor: IPreviousPageCursorReducer;
	getNextPage: (datasetID: string, cursorDate: string) => void;
	getPreviousPage: (datasetID: string, cursorDate: string) => void;
	activeDataset: IActiveDatasetReducer;
	setPreviewID: (previewID: number) => ISetActiveDatasetInputsPreviewIDAction;
	selectedInputPreviewID: IActiveDatasetInputsPreviewIDReducer;
}

const DatasetMultiInputPreviewC = React.memo(
	({
		h,
		activeDatasetInputs,
		nextPageCursor,
		previousPageCursor,
		getNextPage,
		getPreviousPage,
		activeDataset,
		setPreviewID,
		selectedInputPreviewID,
	}: Props) => {
		const datasetID = activeDataset.value.dataset?.id;
		const isThereANextPage = nextPageCursor.value !== null;
		const isThereAPreviousPage = previousPageCursor.value !== null;
		const horizontalScrollbar = useHorizontalScrollbar('5px');
		const previewBG = mode('thia.gray.150', 'thia.gray.850');
		const borderColor = mode('thia.gray.200', 'thia.gray.700');
		const textColor = mode('thia.gray.700', 'thia.gray.300');
		const noImageIconColor = mode('thia.purple.600', 'thia.purple.300');
		const navButtonColor = mode('thia.gray.50', 'thia.purple.800');

		const navigatePaginationWithKeyboard = useCallback(
			(event: KeyboardEvent) => {
				if (event.key == 'ArrowRight') {
					event.preventDefault();
					if (selectedInputPreviewID.value == activeDatasetInputs.value.length - 1) {
						if (datasetID!.length > 0 && nextPageCursor.value) {
							getNextPage(datasetID!, nextPageCursor.value);
						}
					} else {
						setPreviewID(selectedInputPreviewID.value + 1);
					}
				} else if (event.key == 'ArrowLeft') {
					event.preventDefault();
					if (selectedInputPreviewID.value == 0) {
						if (datasetID!.length > 0 && previousPageCursor.value) {
							getPreviousPage(datasetID!, previousPageCursor.value);
						}
					} else {
						setPreviewID(selectedInputPreviewID.value - 1);
					}
				}
			},
			[selectedInputPreviewID, activeDatasetInputs, nextPageCursor, previousPageCursor],
		);

		useEffect(() => {
			window.addEventListener('keydown', navigatePaginationWithKeyboard);

			return () => {
				window.removeEventListener('keydown', navigatePaginationWithKeyboard);
			};
		}, [navigatePaginationWithKeyboard]);

		const renderPagination = () => {
			if (activeDatasetInputs.value.length == 0) {
				return (
					<Center
						w='100%'
						h='100%'
						flexDir='column'
						bg={previewBG}
						borderRadius='md'
						borderWidth='1px'
						borderColor={borderColor}>
						<Icon as={MdImageNotSupported} boxSize='7' color={noImageIconColor} opacity={0.3} />
						<Text fontSize='sm' color={textColor} fontWeight='thin' mt='2'>
							No Images in Dataset
						</Text>
					</Center>
				);
			} else {
				return (
					<HStack
						w='100%'
						h='100%'
						overflowX='auto'
						pt='1.5'
						pb='1.5'
						px='1.5'
						bg={previewBG}
						borderRadius='md'
						overflowY='hidden'
						borderWidth='1px'
						borderColor={borderColor}
						sx={horizontalScrollbar}>
						{Array(activeDatasetInputs.value.length)
							.fill(0)
							.map((_, i) => {
								return <PaginationCell key={i} input={activeDatasetInputs.value[i]} cellID={i} />;
							})}
					</HStack>
				);
			}
		};

		return (
			<Flex w='full' h={h} mt='2'>
				<Center h='full' cursor='pointer' pr='1'>
					<Button
						leftIcon={<GrFormPrevious />}
						px='0'
						size='xs'
						variant='solid'
						title='Previous Page'
						colorScheme='thia.purple'
						iconSpacing='0'
						borderRadius='full'
						isDisabled={!isThereAPreviousPage}
						onClick={() => {
							if (datasetID!.length > 0 && previousPageCursor.value) {
								getPreviousPage(datasetID!, previousPageCursor.value);
							}
						}}
					/>
				</Center>
				{renderPagination()}
				<Center h='full' cursor='pointer' pl='1'>
					<Button
						leftIcon={<GrFormNext />}
						px='0'
						size='xs'
						variant='solid'
						colorScheme='thia.purple'
						title='Next Page'
						color={navButtonColor}
						iconSpacing='0'
						borderRadius='full'
						isDisabled={!isThereANextPage}
						onClick={() => {
							if (datasetID!.length > 0 && nextPageCursor.value) {
								getNextPage(datasetID!, nextPageCursor.value);
							}
						}}
					/>
				</Center>
			</Flex>
		);
	},
);

DatasetMultiInputPreviewC.displayName = 'DatasetMultiInputPreview';

const mapStateToProps = (state: IAppState) => ({
	activeDatasetInputs: state.activeDatasetInputs,
	nextPageCursor: state.nextPageCursor,
	previousPageCursor: state.previousPageCursor,
	activeDataset: state.activeDataset,
	selectedInputPreviewID: state.activeDatasetInputsPreviewID,
});

/**
 * Pagination component when previewing a dataset's inputs.
 */
export const DatasetMultiInputPreview = connect(mapStateToProps, {
	getNextPage: getNextPageInputsAction,
	getPreviousPage: getPreviousPageInputsAction,
	setPreviewID: setActiveDatasetInputsPreviewIDAction,
})(DatasetMultiInputPreviewC);
