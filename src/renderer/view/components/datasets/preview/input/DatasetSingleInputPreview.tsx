import React, { useEffect, useMemo, useRef, useState } from 'react';

import { Box, Button, Center, chakra, HStack, Image, LayoutProps, Spinner, useBreakpointValue } from '@chakra-ui/react';
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
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { useProgressiveImage } from '_/renderer/view/helpers/hooks/useProgressiveImage';
import { nullInput } from '_/renderer/view/helpers/constants/engineDBTypes';
import { IActiveDatasetReducer } from '_/renderer/state/active-dataset-page/model/reducerTypes';
import { TransformComponent, TransformWrapper } from 'react-zoom-pan-pinch';
import { resolutionToMegapixels } from '_/renderer/view/helpers/functionHelpers';

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
		// Load only once active input has been received
		const [imageLoaded, imageSrc] = useProgressiveImage(
			`${ENGINE_URL}/dataset/${datasetID}/input/${activeInput.id}`,
			{
				readyToLoad: datasetID!.length > 0 && activeInput.id.length > 0,
			},
		);

		const imgRef = useRef<HTMLImageElement | null>(null);
		const containerRef = useRef<HTMLDivElement | null>(null);
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		const setTransformRef = useRef<any | null>(null);

		const buttonSize = useBreakpointValue({ base: 'xs', xl: 'sm' }) ?? '';

		const resetImage = (image: HTMLImageElement, container: HTMLDivElement, setTransform: (...any) => void) => {
			const containerWidth = Math.round(container.getBoundingClientRect().width);
			const containerHeight = Math.round(container.getBoundingClientRect().height);
			let newPositionY = Math.abs(containerHeight - image.height) / 2;
			let newPositionX = Math.abs(containerWidth - image.width) / 2;
			if (image.width <= image.height || image.height >= containerHeight) {
				newPositionY *= -1;
			}
			if (image.width < containerWidth && image.height < containerHeight) {
				// Change back to positive
				newPositionY *= -1;
			}
			if (image.width == containerWidth) {
				newPositionX = 0;
			}

			setTransform(newPositionX, newPositionY, 1, ANIMATION_TIME, 'easeInOutCubic');
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
		const megapixelToScale = (megapixels: number) => {
			if (megapixels < 4) {
				return 2;
			} else if (megapixels < 8) {
				return 3;
			} else if (megapixels < 12) {
				return 4;
			} else if (megapixels < 22) {
				return 4.5;
			} else if (megapixels < 48) {
				return 5;
			} else {
				return 6;
			}
		};
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

		const renderPreview = () => {
			return (
				<Box w={w} h='full' bg='gray.800' borderLeftRadius='md' overflow='hidden' ref={containerRef}>
					<TransformWrapper
						limitToBounds
						maxScale={maxScale}
						panning={{ velocityDisabled: false }}
						pinch={{ disabled: true }}>
						{({ resetTransform, centerView, zoomIn, zoomOut, setTransform }) => {
							setTransformRef.current = setTransform;
							return (
								<Box position='relative' w='full' h='full'>
									<HStack position='absolute' zIndex={2} right='2' top='2'>
										<Button
											colorScheme='blue'
											size={buttonSize}
											onClick={() => {
												zoomIn();
											}}>
											+
										</Button>
										<Button
											colorScheme='blue'
											size={buttonSize}
											onClick={() => {
												zoomOut(0.5, ANIMATION_TIME, 'easeInOutCubic');
											}}>
											-
										</Button>
										<Button
											colorScheme='blue'
											size={buttonSize}
											onClick={async () => {
												if (imgRef.current && containerRef.current) {
													resetImage(imgRef.current, containerRef.current, setTransform);
												} else {
													// Shittier version
													resetTransform(0);
													centerView(undefined, ANIMATION_TIME, 'easeInOutCubic');
												}
											}}>
											Reset
										</Button>
									</HStack>
									<TransformComponent
										wrapperStyle={{
											height: '100%',
											width: '100%',
											zIndex: 1,
											cursor: 'grab',
										}}>
										<chakra.img
											ref={imgRef}
											onLoad={(e) => {
												// When image has initially loaded or image src has changed (and been loaded)
												const img = e.target as HTMLImageElement;
												// Change max scale depending on the resolution of the image

												setMaxScale(
													megapixelToScale(
														resolutionToMegapixels(img.naturalWidth, img.naturalHeight),
													),
												);
												if (containerRef.current) {
													resetImage(img, containerRef.current, setTransform);
												} else {
													// Shittier version
													resetTransform(0);
													centerView(undefined, ANIMATION_TIME, 'easeInOutCubic');
												}
											}}
											h='100%'
											w='100%'
											src={imageSrc}
											objectFit='cover'
										/>
									</TransformComponent>
								</Box>
							);
						}}
					</TransformWrapper>
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
 * Previews a dataset input in a larger size on top of {@link PreviewDatasetPagination `PreviewDatasetPagination`}.
 */
export const DatasetSingleInputPreview = connect(mapStateToProps, {
	setInputPreviewID: setActiveDatasetInputsPreviewIDAction,
})(DatasetSingleInputPreviewC);
