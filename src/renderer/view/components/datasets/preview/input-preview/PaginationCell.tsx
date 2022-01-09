import React from 'react';

import { Box, Center, Image, Spinner } from '@chakra-ui/react';
import { connect } from 'react-redux';

import NoImage from '_utils/images/placeholder-dark2.jpg';
import { IAppState } from '_/renderer/state/reducers';
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { PreviewDatasetPagination } from './PreviewDatasetPagination';
import { Input } from '_/renderer/view/helpers/constants/engineDBTypes';
import { ENGINE_URL } from '_/renderer/engine-requests/constants';
import { useProgressiveImage } from '_/renderer/view/helpers/customHooks';
import { IActiveDatasetReducer } from '_/renderer/state/active-dataset-page/model/reducerTypes';

interface Props {
	input: Input;
	activeDataset: IActiveDatasetReducer;
}

const PaginationCellC = React.memo(({ input, activeDataset }: Props) => {
	const datasetID = activeDataset.value?.id;
	const [imageLoaded, imageSrc] = useProgressiveImage(
		`${ENGINE_URL}/dataset/${datasetID}/input/${input.id}`,
		datasetID!.length > 0,
	);

	const render = () => {
		if (!imageLoaded) {
			return (
				<Center minW='200px' w='full' h='full' borderTopRadius='lg'>
					<Spinner color='gray.600' size='lg' />
				</Center>
			);
		}

		return (
			<Box minW='200px' h='full' my='2' bg='red.600'>
				<Image
					onClick={() => {}}
					fit='cover'
					h='full'
					w='full'
					src={imageSrc}
					fallbackSrc={NoImage}
				/>
			</Box>
		);
	};
	return render();
});

const mapStateToProps = (state: IAppState) => ({
	activeDataset: state.activeDataset,
});

/**
 * A single cell of the {@link PreviewDatasetPagination `PreviewDatasetPagination`} component that displays a single dataset input.
 */
export const PaginationCell = connect(mapStateToProps)(PaginationCellC);
