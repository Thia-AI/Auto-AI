import React, { Component } from 'react';
import {
	HStack,
	Modal,
	ModalOverlay,
	ModalContent,
	ModalHeader,
	ModalBody,
	ModalCloseButton,
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

class ModelSelectionC extends Component<Props> {
	render() {
		return (
			<Modal
				isOpen={this.props.modalOpenedState.value}
				onClose={this.props.openCloseModelSelectionAction}
				motionPreset='slideInBottom'
				size='4xl'
				scrollBehavior='inside'>
				<ModalOverlay />
				<ModalContent>
					<ModalHeader>Select Model</ModalHeader>
					<ModalCloseButton />
					<ModalBody
						mt='2'
						sx={{
							'&::-webkit-scrollbar': {
								width: '10px',
								borderRadius: '8px',
								backgroundColor: 'gray.600',
							},
							'&::-webkit-scrollbar-thumb': {
								borderRadius: '8px',
								backgroundColor: 'gray.800',
							},
							'&::-webkit-scrollbar-thumb:hover': {
								backgroundColor: 'gray.900',
							},
						}}>
						<HStack
							spacing='14px'
							overflowX='auto'
							pb='1'
							sx={{
								'&::-webkit-scrollbar': {
									height: '10px',
									borderRadius: '8px',
									backgroundColor: 'gray.600',
								},
								'&::-webkit-scrollbar-thumb': {
									borderRadius: '8px',
									backgroundColor: 'gray.800',
								},
								'&::-webkit-scrollbar-thumb:hover': {
									backgroundColor: 'gray.900',
								},
							}}>
							<ModelPreviewCard
								badge='new'
								cardTitle='Image Classification'
								updatedDate='06/06/2021'
								badgeColorScheme='teal'
								cardDescription='Image classifier trained on your dataset.'
								imageSrc={Preview}
								toolTipInfo='Training Time: 1 Hr / 10k Images'
								selectedModelNumber={0}
							/>
							<ModelPreviewCard
								badge='soon'
								badgeColorScheme='yellow'
								cardTitle='Object Detection'
								updatedDate='06/06/2021'
								cardDescription='Detect objects from images or video.'
								imageSrc={Preview}
								toolTipInfo='Training Time: 1 Hr / 2k Images'
								selectedModelNumber={1}
							/>
							<ModelPreviewCard
								badge='tba'
								cardTitle='Object Tracking'
								badgeColorScheme='red'
								updatedDate='05/23/2021'
								cardDescription='Detect and track objects throughout their lifecycle in a video.'
								imageSrc={Preview}
								toolTipInfo='Training Time: 1 Hr / 2k Images'
								selectedModelNumber={2}
							/>
							<ModelPreviewCard
								badge='tba'
								cardTitle='Generative Model'
								badgeColorScheme='red'
								updatedDate='06/03/2021'
								cardDescription='Generates images similar to those trained on.'
								imageSrc={Preview}
								toolTipInfo='Training Time: 1 Hr / 5k Images'
								selectedModelNumber={3}
							/>
						</HStack>
						<ModelSelectionBody />
					</ModalBody>
				</ModalContent>
			</Modal>
		);
	}
}

const mapStateToProps = (state: IAppState) => {
	return {
		modalOpenedState: state.openCloseModelSelection,
	};
};

export const ModelSelection = connect(mapStateToProps, {
	openCloseModelSelectionAction,
})(ModelSelectionC);
