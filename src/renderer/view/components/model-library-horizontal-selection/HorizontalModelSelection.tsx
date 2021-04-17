import React, { Component } from 'react';
import { ModelSelectionItem } from '../model-selection-item/ModelSelectionItem';

import './HorizontalModelSelection.css';

interface Props {
	onClick: (model: number) => void;
}

export class HorizontalModelSelection extends Component<Props> {
	render() {
		return (
			<React.Fragment>
				<div className='model-selection-container'>
					<ModelSelectionItem
						modelName='Image Classification Model'
						backgroundImageUrl='https://bookmanlaw.com/wp-content/uploads/2016/09/ef3-placeholder-image.jpg'
						onClick={() => this.props.onClick(0)}
					/>
					<ModelSelectionItem
						modelName='Object Detection Model'
						backgroundImageUrl='https://bookmanlaw.com/wp-content/uploads/2016/09/ef3-placeholder-image.jpg'
						onClick={() => this.props.onClick(1)}
					/>
					<ModelSelectionItem
						modelName='Generative Model'
						backgroundImageUrl='https://bookmanlaw.com/wp-content/uploads/2016/09/ef3-placeholder-image.jpg'
						onClick={() => this.props.onClick(2)}
					/>
				</div>
			</React.Fragment>
		);
	}
}
