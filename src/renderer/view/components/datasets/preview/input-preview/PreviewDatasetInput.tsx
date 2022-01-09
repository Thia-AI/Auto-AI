import React, { useEffect } from 'react';

import { Box, Center, Image, LayoutProps, Spinner } from '@chakra-ui/react';
import { IAppState } from '_/renderer/state/reducers';
import { connect } from 'react-redux';

import NoImage from '_utils/images/placeholder-dark2.jpg';

import {
	IActiveDatasetInputsPreviewIDReducer,
	IActiveDatasetInputsReducer,
} from '_/renderer/state/active-dataset-inputs/model/reducerTypes';
import { setActiveDatasetInputsPreviewIDAction } from '_/renderer/state/active-dataset-inputs/ActiveDatasetInputsActions';
import { ISetActiveDatasetInputsPreviewIDAction } from '_/renderer/state/active-dataset-inputs/model/actionTypes';
import { ENGINE_URL } from '_/renderer/engine-requests/constants';
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { PreviewDatasetPagination } from './PreviewDatasetPagination';
import { useProgressiveImage } from '_/renderer/view/helpers/customHooks';
import { nullInput } from '_/renderer/view/helpers/constants/engineDBTypes';
import { IActiveDatasetReducer } from '_/renderer/state/active-dataset-page/model/reducerTypes';

interface Props {
	activeDatasetInputs: IActiveDatasetInputsReducer;
	setInputPreviewID: (previewID: number) => ISetActiveDatasetInputsPreviewIDAction;
	previewInputID: IActiveDatasetInputsPreviewIDReducer;
	w: LayoutProps['w'];
	activeDataset: IActiveDatasetReducer;
}

const PreviewDatasetInputC = React.memo(
	({ activeDatasetInputs, setInputPreviewID, previewInputID, w, activeDataset }: Props) => {
		const datasetID = activeDataset.value?.id;
		const activeInput = activeDatasetInputs.value[previewInputID.value] ?? nullInput;
		// Load only once active input has been received
		const [imageLoaded, imageSrc] = useProgressiveImage(
			`${ENGINE_URL}/dataset/${datasetID}/input/${activeInput.id}`,
			datasetID!.length > 0,
		);
		useEffect(() => {
			setInputPreviewID(0);
			return () => {
				setInputPreviewID(0);
			};
		}, []);

		// TODO: Create no preview component
		const renderNoPreview = () => {
			return (
				<Box w={w} h='full' bg='red.400'>
					Nothing.
				</Box>
			);
		};

		const renderPreview = () => {
			return (
				<Box w={w} h='full' bg='gray.800'>
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

		const renderLoading = () => {
			return (
				<Center h='full' w={w}>
					<Spinner color='gray.600' size='lg' />
				</Center>
			);
		};
		const render = () => {
			if (activeDatasetInputs.value.length !== 0) {
				return renderPreview();
			}
			if (!imageLoaded) {
				return renderLoading();
			}
			return renderNoPreview();
		};

		return render();
	},
);

const mapStateToProps = (state: IAppState) => ({
	activeDatasetInputs: state.activeDatasetInputs,
	previewInputID: state.activeDatasetInputsPreviewID,
	activeDataset: state.activeDataset,
});

/**
 * Previews a dataset input in a larger size on top of {@link PreviewDatasetPagination `PreviewDatasetPagination`}.
 */
export const PreviewDatasetInput = connect(mapStateToProps, {
	setInputPreviewID: setActiveDatasetInputsPreviewIDAction,
})(PreviewDatasetInputC);
