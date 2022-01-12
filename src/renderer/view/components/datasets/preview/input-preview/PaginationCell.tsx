import React, { useEffect, useRef, useState } from 'react';

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
import { setActiveDatasetInputsPreviewIDAction } from '_/renderer/state/active-dataset-inputs/ActiveDatasetInputsActions';
import { ISetActiveDatasetInputsPreviewIDAction } from '_/renderer/state/active-dataset-inputs/model/actionTypes';
import { IActiveDatasetInputsPreviewIDReducer } from '_/renderer/state/active-dataset-inputs/model/reducerTypes';
import { sleep } from '_/renderer/view/helpers/engineJobHelper';

interface Props {
	input: Input;
	activeDataset: IActiveDatasetReducer;
	setActivePreviewID: (previewID: number) => ISetActiveDatasetInputsPreviewIDAction;
	cellID: number;
	selectedInputPreviewID: IActiveDatasetInputsPreviewIDReducer;
}

const PaginationCellC = React.memo(
	({ input, activeDataset, setActivePreviewID, cellID, selectedInputPreviewID }: Props) => {
		const datasetID = activeDataset.value?.id;
		const ref = useRef<HTMLDivElement>(null);
		const [isSelectedCell, setIsSelectedCell] = useState(false);
		const [imageLoaded, imageSrc] = useProgressiveImage(`${ENGINE_URL}/dataset/${datasetID}/input/${input.id}`, {
			readyToLoad: datasetID!.length > 0,
		});

		const checkIfPaginationCellIsSelected = async () => {
			if (cellID == selectedInputPreviewID.value) {
				setIsSelectedCell(true);
				// Quick hack fix because it wouldn't scroll to the cell if previous page was clicked.
				await sleep(100);
				ref.current?.scrollIntoView({ behavior: 'smooth', inline: 'center' });
			} else {
				setIsSelectedCell(false);
			}
		};
		useEffect(() => {
			checkIfPaginationCellIsSelected();
		}, [cellID, selectedInputPreviewID]);

		const render = () => {
			if (!imageLoaded) {
				return (
					<Center
						h='full'
						borderRadius='md'
						css={{
							aspectRatio: '1 / 1',
						}}>
						<Spinner color='gray.600' size='sm' />
					</Center>
				);
			}

			return (
				<Box
					h='full'
					borderRadius='md'
					cursor='pointer'
					boxShadow={isSelectedCell ? 'outline' : 'none'}
					ref={ref}
					onClick={() => {
						setActivePreviewID(cellID);
					}}
					css={{
						aspectRatio: '1 / 1',
					}}>
					<Image fit='cover' borderRadius='md' h='full' w='full' src={imageSrc} fallbackSrc={NoImage} />
				</Box>
			);
		};
		return render();
	},
);

const mapStateToProps = (state: IAppState) => ({
	activeDataset: state.activeDataset,
	selectedInputPreviewID: state.activeDatasetInputsPreviewID,
});

/**
 * A single cell of the {@link PreviewDatasetPagination `PreviewDatasetPagination`} component that displays a single dataset input.
 */
export const PaginationCell = connect(mapStateToProps, {
	setActivePreviewID: setActiveDatasetInputsPreviewIDAction,
})(PaginationCellC);
