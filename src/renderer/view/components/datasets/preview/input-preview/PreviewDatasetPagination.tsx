import { Center, Flex, LayoutProps } from '@chakra-ui/react';
import React from 'react';
import { connect } from 'react-redux';
import { IActiveDatasetInputsReducer } from '_/renderer/state/active-dataset-inputs/model/reducerTypes';
import { IAppState } from '_/renderer/state/reducers';
import { PaginationCell } from './PaginationCell';

interface Props {
	h: LayoutProps['h'];
	activeDatasetInputs: IActiveDatasetInputsReducer;
}

const PreviewDatasetPaginationC = React.memo(({ h, activeDatasetInputs }: Props) => {
	return (
		<Flex w='full' h={h} mt='2'>
			<Center w='35px' h='full' cursor='pointer' bg='red.400'>
				Left
			</Center>
			<Flex
				w='100%'
				h='100%'
				overflowX='auto'
				overflowY='hidden'
				sx={{
					'&::-webkit-scrollbar': {
						h: '8px',
						bg: 'gray.600',
					},
					'&::-webkit-scrollbar-thumb': {
						bg: 'gray.900',
					},
				}}>
				{Array(activeDatasetInputs.value.length)
					.fill(0)
					.map((_, i) => {
						return <PaginationCell key={i} input={activeDatasetInputs.value[i]} />;
					})}
			</Flex>
			<Center w='35px' h='full' cursor='pointer' bg='red.400'>
				Right
			</Center>
		</Flex>
	);
});

const mapStateToProps = (state: IAppState) => ({
	activeDatasetInputs: state.activeDatasetInputs,
});

/**
 * Pagination component when previewing a dataset's inputs.
 */
export const PreviewDatasetPagination = connect(mapStateToProps)(PreviewDatasetPaginationC);
