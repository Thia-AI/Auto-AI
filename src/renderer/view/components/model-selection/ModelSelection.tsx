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

import Preview from '_utils/images/placeholder-image.jpg';

interface Props {
	modalOpenedState: IOpenCloseModelSelectionReducer;
	openCloseModelSelectionAction: () => IOpenCloseModelSelectionAction;
}

const ModelSelectionC = React.memo((props: Props) => {
	const [isLargerThan1280] = useMediaQuery('(min-width: 1280px)');
	return (
		<Modal
			isOpen={props.modalOpenedState.value}
			blockScrollOnMount={true}
			onClose={props.openCloseModelSelectionAction}
			motionPreset='slideInBottom'
			size={isLargerThan1280 ? '6xl' : '4xl'}
			isCentered
			scrollBehavior='inside'>
			<ModalOverlay />
			<ModalContent transition='all 200ms' overflow='hidden'>
				<ModalHeader>Select Model</ModalHeader>
				<ModalCloseButton size='sm' />
				<ModalBody
					mt='2'
					sx={{
						'&::-webkit-scrollbar': {
							w: '8px',
							bg: 'gray.600',
						},
						'&::-webkit-scrollbar-thumb': {
							bg: 'gray.900',
						},
					}}>
					<HStack
						spacing='14px'
						overflowX='auto'
						pb='3'
						sx={{
							'&::-webkit-scrollbar': {
								h: '8px',
								bg: 'gray.600',
							},
							'&::-webkit-scrollbar-thumb': {
								bg: 'gray.900',
							},
						}}>
						<ModelPreviewCard
							badge='new'
							cardTitle='Image Classification'
							updatedDate='06/06/2021'
							badgeColorScheme='teal'
							cardDescription='Image classifier trained on your dataset.'
							imageSrc={Preview}
							selectedModelNumber={0}
						/>
						<ModelPreviewCard
							badge='soon'
							badgeColorScheme='yellow'
							cardTitle='Object Detection'
							updatedDate='06/06/2021'
							cardDescription='Detect objects from images or video.'
							imageSrc={Preview}
							selectedModelNumber={1}
						/>
						<ModelPreviewCard
							badge='tba'
							cardTitle='Object Tracking'
							badgeColorScheme='red'
							updatedDate='05/23/2021'
							cardDescription='Detect and track objects throughout their lifecycle in a video.'
							imageSrc={Preview}
							selectedModelNumber={2}
						/>
						<ModelPreviewCard
							badge='tba'
							cardTitle='Generative Model'
							badgeColorScheme='red'
							updatedDate='06/03/2021'
							cardDescription='Generates images similar to those trained on.'
							imageSrc={Preview}
							selectedModelNumber={3}
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
