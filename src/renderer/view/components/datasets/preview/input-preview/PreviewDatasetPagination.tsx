import { Button, Center, Flex, HStack, LayoutProps } from '@chakra-ui/react';
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

const PreviewDatasetPaginationC = React.memo(
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
		const datasetID = activeDataset.value?.id;
		const isThereANextPage = nextPageCursor.value !== null;
		const isThereAPreviousPage = previousPageCursor.value !== null;

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

		return (
			<Flex w='full' h={h} mt='2'>
				<Center h='full' cursor='pointer' pr='1'>
					<Button
						leftIcon={<GrFormPrevious />}
						px='0'
						size='xs'
						variant='solid'
						title='Previous Page'
						colorScheme='teal'
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
				<HStack
					w='100%'
					h='100%'
					overflowX='auto'
					pt='0.5'
					pb='1.5'
					px='1'
					overflowY='hidden'
					sx={{
						'&::-webkit-scrollbar': {
							h: '5px',
							bg: 'gray.600',
						},
						'&::-webkit-scrollbar-thumb': {
							bg: 'gray.900',
						},
					}}>
					{Array(activeDatasetInputs.value.length)
						.fill(0)
						.map((_, i) => {
							return <PaginationCell key={i} input={activeDatasetInputs.value[i]} cellID={i} />;
						})}
				</HStack>
				<Center h='full' cursor='pointer' pl='1'>
					<Button
						leftIcon={<GrFormNext />}
						px='0'
						size='xs'
						variant='solid'
						colorScheme='teal'
						title='Next Page'
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
export const PreviewDatasetPagination = connect(mapStateToProps, {
	getNextPage: getNextPageInputsAction,
	getPreviousPage: getPreviousPageInputsAction,
	setPreviewID: setActiveDatasetInputsPreviewIDAction,
})(PreviewDatasetPaginationC);
