import React, { Component } from 'react';
import { HorizontalModelSelection } from '../../model-library-horizontal-selection/HorizontalModelSelection';
import { GenerativeSelection } from '../../model-selection-descriptions/generative/GenerativeSelection';
import { ImageClassificationSelection } from '../../model-selection-descriptions/image-classification/ImageClassificationSelection';
import { ObjectDetectionSelection } from '../../model-selection-descriptions/object-detection/ObjectDetectionSelection';

import './SelectModelContent.css';

export class SelectModelContent extends Component {
	state = {
		selectedModel: 0,
	};

	setSelectedModel = (model: number) => {
		this.setState({ selectedModel: model });
		console.log(`Model Changed To ${model}`);
	};
	renderDescription = () => {
		switch (this.state.selectedModel) {
			case 0:
				return <ImageClassificationSelection />;
			case 1:
				return <ObjectDetectionSelection />;
			case 2:
				return <GenerativeSelection />;
		}
	};
	render() {
		return (
			<div className='select-model-content'>
				<HorizontalModelSelection onClick={this.setSelectedModel} />
				<div className='model-description-container'>
					{this.renderDescription()}
				</div>
			</div>
		);
	}
}
