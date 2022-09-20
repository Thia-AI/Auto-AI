import React, { useEffect, useMemo, useRef, useState } from 'react';

import {
	Box,
	Button,
	Center,
	chakra,
	HStack,
	Icon,
	Image,
	LayoutProps,
	Spinner,
	useBreakpointValue,
	useColorModeValue as mode,
	useDisclosure,
} from '@chakra-ui/react';
import { IAppState } from '_/renderer/state/reducers';
import { connect } from 'react-redux';
import { debounce } from 'debounce';

import NoImage from '_utils/images/placeholder-dark2.jpg';

import {
	IActiveDatasetInputsPreviewIDReducer,
	IActiveDatasetInputsReducer,
} from '_/renderer/state/active-dataset-inputs/model/reducerTypes';
import { setActiveDatasetInputsPreviewIDAction } from '_/renderer/state/active-dataset-inputs/ActiveDatasetInputsActions';
import { ISetActiveDatasetInputsPreviewIDAction } from '_/renderer/state/active-dataset-inputs/model/actionTypes';
import { ENGINE_URL } from '_/renderer/engine-requests/constants';
import { useProgressiveImage } from '_/renderer/view/helpers/hooks/progressiveImage';
import { nullInput } from '_/renderer/view/helpers/constants/engineTypes';
import { IActiveDatasetReducer } from '_/renderer/state/active-dataset-page/model/reducerTypes';
import { ReactZoomPanPinchHandlers, TransformComponent, TransformWrapper } from 'react-zoom-pan-pinch';
import { resolutionToMegapixels } from '_/renderer/view/helpers/functionHelpers';
import { BsTrash } from 'react-icons/bs';
import { DeleteImageDialog } from './DeleteImageDialog';
import { SingleInputPreviewWrapperChild } from './SingleInputPreviewWrapperChild';

interface Props {
	activeDatasetInputs: IActiveDatasetInputsReducer;
	setInputPreviewID: (previewID: number) => ISetActiveDatasetInputsPreviewIDAction;
	previewInputID: IActiveDatasetInputsPreviewIDReducer;
	w: LayoutProps['w'];
	activeDataset: IActiveDatasetReducer;
}

const DatasetSingleInputPreviewC = React.memo(
	({ activeDatasetInputs, setInputPreviewID, previewInputID, w, activeDataset }: Props) => {
		const ANIMATION_TIME = 250;
		const DEBOUNCE_TIME = 225;

		const datasetID = activeDataset.value.dataset?.id;
		const activeInput = activeDatasetInputs.value[previewInputID.value] ?? nullInput;
		const [maxScale, setMaxScale] = useState(1);
		const [zoomInButtonDisabled, setZoomInButtonDisabled] = useState(false);
		const [zoomOutButtonDisabled, setZoomOutButtonDisabled] = useState(true);
		const {
			isOpen: isDeleteImageDialogOpen,
			onClose: closeDeleteImageDialog,
			onOpen: openDeleteImageDialog,
		} = useDisclosure();
		// Load only once active input has been received
		const [imageLoaded, imageSrc] = useProgressiveImage(
			`${ENGINE_URL}/dataset/${datasetID}/input/${activeInput.id}`,
			{
				readyToLoad: datasetID!.length > 0 && activeInput.id.length > 0,
			},
		);
		const previewBG = mode('thia.gray.150', 'thia.gray.850');
		const borderColor = mode('thia.gray.200', 'thia.gray.700');

		const imgRef = useRef<HTMLImageElement | null>(null);
		const containerRef = useRef<HTMLDivElement | null>(null);
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		const setTransformRef = useRef<any | null>(null);

		const resetImage = (
			image: HTMLImageElement,
			container: HTMLDivElement,
			setTransform: ReactZoomPanPinchHandlers['setTransform'],
		) => {
			const containerWidth = Math.round(container.getBoundingClientRect().width);
			const containerHeight = Math.round(container.getBoundingClientRect().height);
			let newPositionY = Math.abs(containerHeight - image.height) / 2;
			let newPositionX = Math.abs(containerWidth - image.width) / 2;
			if (image.width <= image.height || image.height >= containerHeight) {
				newPositionY *= -1;
			}
			if (image.width < containerWidth && image.height < containerHeight) {
				// Change back to positive
				newPositionY = Math.abs(newPositionY);
			}
			if (image.width == containerWidth) {
				newPositionX = 0;
			}

			setTransform(newPositionX, newPositionY, 1, ANIMATION_TIME, 'easeInOutCubic');
			setZoomOutButtonDisabled(true);
			setZoomInButtonDisabled(false);
		};

		const resetImageOnWindowResize = (e: UIEvent) => {
			e.preventDefault();
			if (imgRef.current && containerRef.current && setTransformRef.current) {
				resetImage(imgRef.current, containerRef.current, setTransformRef.current);
			}
		};

		const resetImageOnWindowResizeDebounce = useMemo(() => debounce(resetImageOnWindowResize, DEBOUNCE_TIME), []);

		useEffect(() => {
			if (imgRef.current && containerRef.current) {
				window.addEventListener('resize', resetImageOnWindowResizeDebounce);
				return () => {
					window.removeEventListener('resize', resetImageOnWindowResizeDebounce);
				};
			}
		}, [imgRef.current, containerRef.current]);

		useEffect(() => {
			setInputPreviewID(0);
			return () => {
				setInputPreviewID(0);
			};
		}, []);
		// TODO: Create no preview component
		const renderNoPreview = () => {
			return (
				<Center w={w} h='full' borderLeftRadius='md' overflow='hidden'>
					<Image fit='cover' h='full' w='full' src={NoImage} />
				</Center>
			);
		};

		const handleZoomChange = (scale: number, previousScale: number) => {
			if (scale > previousScale) {
				// Zoomed in
				if (scale >= maxScale) {
					setZoomInButtonDisabled(true);
				}
				setZoomOutButtonDisabled(false);
			} else {
				// Zoomed out
				if (scale <= 1) {
					setZoomOutButtonDisabled(true);
				}
				setZoomInButtonDisabled(false);
			}
		};

		const renderPreview = () => {
			return (
				<Box
					w={w}
					h='full'
					bg={previewBG}
					borderLeftRadius='md'
					overflow='hidden'
					borderWidth='1px'
					borderColor={borderColor}
					ref={containerRef}>
					<TransformWrapper
						limitToBounds
						maxScale={maxScale}
						panning={{ velocityDisabled: false }}
						pinch={{ disabled: true }}>
						{({ resetTransform, centerView, zoomIn, zoomOut, setTransform, state }) => {
							setTransformRef.current = setTransform;
							return (
								<SingleInputPreviewWrapperChild
									resetTransform={resetTransform}
									centerView={centerView}
									zoomIn={zoomIn}
									zoomOut={zoomOut}
									setTransform={setTransform}
									state={state}
									animationTime={ANIMATION_TIME}
									zoomInButtonDisabled={zoomInButtonDisabled}
									zoomOutButtonDisabled={zoomOutButtonDisabled}
									imgRef={imgRef}
									containerRef={containerRef}
									resetImage={resetImage}
									openDeleteImageDialog={openDeleteImageDialog}
									setMaxScale={setMaxScale}
									imageSrc={imageSrc}
									handleZoomChange={handleZoomChange}
								/>
							);
						}}
					</TransformWrapper>
					<DeleteImageDialog
						isOpen={isDeleteImageDialogOpen}
						onClose={closeDeleteImageDialog}
						activeInput={activeInput}
						datasetID={datasetID}
					/>
				</Box>
			);
		};

		const renderLoading = () => {
			return (
				<Center h='full' w={w} borderLeftRadius='md' overflow='hidden'>
					<Spinner color='gray.600' size='lg' />
				</Center>
			);
		};
		const render = () => {
			if (activeDatasetInputs.value.length !== 0) {
				if (!imageLoaded) {
					return renderLoading();
				}
				return renderPreview();
			}
			return renderNoPreview();
		};

		return render();
	},
);

DatasetSingleInputPreviewC.displayName = 'DatasetInputPreview';

const mapStateToProps = (state: IAppState) => ({
	activeDatasetInputs: state.activeDatasetInputs,
	previewInputID: state.activeDatasetInputsPreviewID,
	activeDataset: state.activeDataset,
});

/**
 * Previews a dataset input in a larger size.
 */
export const DatasetSingleInputPreview = connect(mapStateToProps, {
	setInputPreviewID: setActiveDatasetInputsPreviewIDAction,
})(DatasetSingleInputPreviewC);
