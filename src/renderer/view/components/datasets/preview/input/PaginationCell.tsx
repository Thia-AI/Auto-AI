import React, { useEffect, useRef, useState } from 'react';

import { Box, Center, chakra, Spinner, useColorModeValue as mode } from '@chakra-ui/react';
import { connect } from 'react-redux';

import { IAppState } from '_/renderer/state/reducers';
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { DatasetMultiInputPreview } from './DatasetMultiInputPreview';
import { Input, Label, nullLabel } from '_/renderer/view/helpers/constants/engineDBTypes';
import { ENGINE_URL } from '_/renderer/engine-requests/constants';
import { useProgressiveImage } from '_/renderer/view/helpers/hooks/progressiveImage';
import { IActiveDatasetReducer } from '_/renderer/state/active-dataset-page/model/reducerTypes';
import { setActiveDatasetInputsPreviewIDAction } from '_/renderer/state/active-dataset-inputs/ActiveDatasetInputsActions';
import { ISetActiveDatasetInputsPreviewIDAction } from '_/renderer/state/active-dataset-inputs/model/actionTypes';
import { IActiveDatasetInputsPreviewIDReducer } from '_/renderer/state/active-dataset-inputs/model/reducerTypes';
import { sleep } from '_/renderer/view/helpers/functionHelpers';

interface Props {
	input: Input;
	activeDataset: IActiveDatasetReducer;
	setActivePreviewID: (previewID: number) => ISetActiveDatasetInputsPreviewIDAction;
	cellID: number;
	selectedInputPreviewID: IActiveDatasetInputsPreviewIDReducer;
}

const PaginationCellC = React.memo(
	({ input, activeDataset, setActivePreviewID, cellID, selectedInputPreviewID }: Props) => {
		const datasetID = activeDataset.value.dataset?.id;
		const ref = useRef<HTMLDivElement>(null);
		const [isSelectedCell, setIsSelectedCell] = useState(false);
		const [label, setLabel] = useState<Label>(nullLabel);
		const [imageLoaded, imageSrc] = useProgressiveImage(`${ENGINE_URL}/dataset/${datasetID}/input/${input.id}`, {
			readyToLoad: datasetID!.length > 0 && input.id.length > 0,
		});
		const brightness = mode('15%', '10%');

		useEffect(() => {
			if (datasetID) {
				// Update the label each time the input changes (if dataset is loaded that is)
				setLabel(activeDataset.value.labels[input.label]);
			}
		}, [datasetID, input]);

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
					outline='2px solid'
					outlineColor={label.value.length > 0 ? label.color : 'transparent'}
					ref={ref}
					onClick={() => {
						setActivePreviewID(cellID);
					}}
					css={{
						aspectRatio: '1 / 1',
					}}>
					<chakra.img
						objectFit='cover'
						objectPosition='center'
						filter={isSelectedCell ? `brightness(${brightness})` : 'none'}
						borderRadius='md'
						h='full'
						w='full'
						src={imageSrc}
					/>
				</Box>
			);
		};
		return render();
	},
);

PaginationCellC.displayName = 'PaginationCell';

const mapStateToProps = (state: IAppState) => ({
	activeDataset: state.activeDataset,
	selectedInputPreviewID: state.activeDatasetInputsPreviewID,
});

/**
 * A single cell of that displays a single dataset input.
 */
export const PaginationCell = connect(mapStateToProps, {
	setActivePreviewID: setActiveDatasetInputsPreviewIDAction,
})(PaginationCellC);
