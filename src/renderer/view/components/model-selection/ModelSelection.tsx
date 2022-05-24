import React from 'react';
import {
	HStack,
	Modal,
	ModalOverlay,
	ModalContent,
	ModalHeader,
	ModalBody,
	ModalCloseButton,
	useMediaQuery,
} from '@chakra-ui/react';

import './ModelSelection.css';

import { openCloseModelSelectionAction } from '_/renderer/state/choose-model/ChooseModelActions';
import { connect } from 'react-redux';
import { IAppState } from '_/renderer/state/reducers';
import { IOpenCloseModelSelectionReducer } from '_/renderer/state/choose-model/model/reducerTypes';
import { IOpenCloseModelSelectionAction } from '_/renderer/state/choose-model/model/actionTypes';

import { ModelPreviewCard } from '../model-preview-card/ModelPreviewCard';
import { ModelSelectionBody } from './ModelSelectionBody';

import ObjectDetectionPreview from '_utils/images/object_detection_card_bg_compressed.jpg';
import ImageClassificationPreview from '_utils/images/image_classification_card_bg.jpg';
import { useHorizontalScrollbar, useVerticalScrollbar } from '_/renderer/view/helpers/hooks/scrollbar';

interface Props {
	modalOpenedState: IOpenCloseModelSelectionReducer;
	openCloseModelSelectionAction: () => IOpenCloseModelSelectionAction;
}

const ModelSelectionC = React.memo((props: Props) => {
	const [isLargerThan1280] = useMediaQuery('(min-width: 1280px)');
	const verticalScrollBarSX = useVerticalScrollbar();
	const horizontalScrollBarSX = useHorizontalScrollbar();
	return (
		<Modal
			isOpen={props.modalOpenedState.value}
			blockScrollOnMount
			onClose={props.openCloseModelSelectionAction}
			motionPreset='slideInBottom'
			size={isLargerThan1280 ? '6xl' : '4xl'}
			isCentered
			scrollBehavior='inside'>
			<ModalOverlay />
			<ModalContent transition='all 200ms' overflow='hidden' h='full'>
				<ModalHeader>Select Model</ModalHeader>
				<ModalCloseButton size='sm' />
				<ModalBody mt='2' sx={verticalScrollBarSX}>
					<HStack spacing='14px' overflowX='auto' pb='3' px='4' sx={horizontalScrollBarSX}>
						<ModelPreviewCard
							badge='new'
							cardTitle='Image Classification'
							updatedDate='06/06/2021'
							badgeColorScheme='teal'
							cardDescription='Image classifier trained on your dataset.'
							imageSrc={ImageClassificationPreview}
							selectedModelNumber={0}
						/>
						<ModelPreviewCard
							badge='soon'
							badgeColorScheme='yellow'
							cardTitle='Object Detection'
							updatedDate='06/06/2021'
							cardDescription='Detect objects from images or video.'
							imageSrc={ObjectDetectionPreview}
							selectedModelNumber={1}
						/>
					</HStack>
					<ModelSelectionBody />
				</ModalBody>
			</ModalContent>
		</Modal>
	);
});

ModelSelectionC.displayName = 'ModelSelection';

const mapStateToProps = (state: IAppState) => {
	return {
		modalOpenedState: state.openCloseModelSelection,
	};
};

/**
 * Modal that opens for creating a new model.
 */
export const ModelSelection = connect(mapStateToProps, {
	openCloseModelSelectionAction,
})(ModelSelectionC);
