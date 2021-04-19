import React, { Component } from 'react';
import { connect } from 'react-redux';
import { IAppState } from '_/renderer/state/reducers';
import HorizontalModelSelection from '../../model-library-horizontal-selection/HorizontalModelSelection';
import { GenerativeSelection } from '../../model-selection-descriptions/generative/GenerativeSelection';
import { ImageClassificationSelection } from '../../model-selection-descriptions/image-classification/ImageClassificationSelection';
import { ObjectDetectionSelection } from '../../model-selection-descriptions/object-detection/ObjectDetectionSelection';

import './SelectModelContent.css';
import { IChangeSelectedModelReducer } from '_/renderer/state/choose-model/model/reducerTypes';

interface Props {
	selectedModel: IChangeSelectedModelReducer;
}

class SelectModelContent extends Component<Props> {
	renderDescription = () => {
		// console.log(this.props.selectedModel.value);

		switch (this.props.selectedModel.value) {
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
				<HorizontalModelSelection />
				<div className='model-description-container'>
					{this.renderDescription()}
				</div>
			</div>
		);
	}
}

const mapStateToProps = (state: IAppState) => {
	return {
		selectedModel: state.selectedModel,
	};
};

export default connect(mapStateToProps)(SelectModelContent);
