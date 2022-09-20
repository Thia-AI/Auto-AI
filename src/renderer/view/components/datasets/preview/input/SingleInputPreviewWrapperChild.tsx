import { Box, Button, chakra, HStack, Icon, useBreakpointValue } from '@chakra-ui/react';
import React, { useEffect } from 'react';
import { BsTrash } from 'react-icons/bs';
import { TransformComponent, ReactZoomPanPinchHandlers, ReactZoomPanPinchState } from 'react-zoom-pan-pinch';
import { resolutionToMegapixels } from '_/renderer/view/helpers/functionHelpers';

interface Props {
	resetTransform: ReactZoomPanPinchHandlers['resetTransform'];
	centerView: ReactZoomPanPinchHandlers['centerView'];
	zoomIn: ReactZoomPanPinchHandlers['zoomIn'];
	zoomOut: ReactZoomPanPinchHandlers['zoomOut'];
	setTransform: ReactZoomPanPinchHandlers['setTransform'];
	state: ReactZoomPanPinchState;
	animationTime: number;
	zoomInButtonDisabled: boolean;
	zoomOutButtonDisabled: boolean;
	imgRef: React.MutableRefObject<HTMLImageElement | null>;
	containerRef: React.MutableRefObject<HTMLDivElement | null>;
	imageSrc: string;
	resetImage: (
		image: HTMLImageElement,
		container: HTMLDivElement,
		setTransform: ReactZoomPanPinchHandlers['setTransform'],
	) => void;
	openDeleteImageDialog: () => void;
	setMaxScale: (scale: number) => void;
	handleZoomChange: (scale: number, previousScale: number) => void;
}
export const SingleInputPreviewWrapperChild = ({
	resetTransform,
	centerView,
	zoomIn,
	zoomOut,
	setTransform,
	state,
	animationTime,
	zoomInButtonDisabled,
	zoomOutButtonDisabled,
	imgRef,
	containerRef,
	imageSrc,
	resetImage,
	openDeleteImageDialog,
	setMaxScale,
	handleZoomChange,
}: Props) => {
	const buttonSize = useBreakpointValue({ base: 'xs', xl: 'sm' }) ?? '';

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
		handleZoomChange(state.scale, state.previousScale);
	}, [state.scale, state.previousScale]);

	return (
		<Box position='relative' w='full' h='full'>
			<HStack position='absolute' zIndex={2} right='2' top='2'>
				<Button
					colorScheme='thia.purple'
					size={buttonSize}
					isDisabled={zoomInButtonDisabled}
					onClick={() => {
						zoomIn();
					}}>
					+
				</Button>
				<Button
					colorScheme='thia.purple'
					size={buttonSize}
					isDisabled={zoomOutButtonDisabled}
					onClick={() => {
						zoomOut(0.5, animationTime, 'easeInOutCubic');
					}}>
					-
				</Button>
				<Button
					colorScheme='thia.purple'
					size={buttonSize}
					onClick={async () => {
						if (imgRef.current && containerRef.current) {
							resetImage(imgRef.current, containerRef.current, setTransform);
						} else {
							// Shittier version
							resetTransform(0);
							centerView(undefined, animationTime, 'easeInOutCubic');
						}
					}}>
					Reset
				</Button>
				<Button colorScheme='red' size={buttonSize} title='Delete Image' onClick={openDeleteImageDialog}>
					<Icon as={BsTrash} />
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
						setMaxScale(megapixelToScale(resolutionToMegapixels(img.naturalWidth, img.naturalHeight)));
						if (containerRef.current) {
							resetImage(img, containerRef.current, setTransform);
						} else {
							// Shittier version
							resetTransform(0);
							centerView(undefined, animationTime, 'easeInOutCubic');
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
};
