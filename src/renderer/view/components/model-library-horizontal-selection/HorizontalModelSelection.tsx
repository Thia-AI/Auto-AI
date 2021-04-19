import React, { Component } from 'react';
import { connect } from 'react-redux';
import { changeSelectedModel } from '_/renderer/state/choose-model/ChooseModelActions';
import { IChangeSelectedModelAction } from '_/renderer/state/choose-model/model/actionTypes';
import { ModelSelectionItem } from '../model-selection-item/ModelSelectionItem';

import './HorizontalModelSelection.css';

interface Props {
	changeSelectedModel: (modelNumber: number) => IChangeSelectedModelAction;
}

class HorizontalModelSelection extends Component<Props> {
	render() {
		return (
			<React.Fragment>
				<div className='model-selection-container'>
					<ModelSelectionItem
						modelName='Image Classification Model'
						backgroundImageUrl='https://bookmanlaw.com/wp-content/uploads/2016/09/ef3-placeholder-image.jpg'
						onClick={() => this.props.changeSelectedModel(0)}
					/>
					<ModelSelectionItem
						modelName='Object Detection Model'
						backgroundImageUrl='https://bookmanlaw.com/wp-content/uploads/2016/09/ef3-placeholder-image.jpg'
						onClick={() => this.props.changeSelectedModel(1)}
					/>
					<ModelSelectionItem
						modelName='Generative Model'
						backgroundImageUrl='https://bookmanlaw.com/wp-content/uploads/2016/09/ef3-placeholder-image.jpg'
						onClick={() => this.props.changeSelectedModel(2)}
					/>
				</div>
			</React.Fragment>
		);
	}
}
const mapStateToProps = () => {
	return {};
};
export default connect(mapStateToProps, {
	changeSelectedModel,
})(HorizontalModelSelection);
