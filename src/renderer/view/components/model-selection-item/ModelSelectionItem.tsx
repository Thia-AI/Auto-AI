import React, { Component } from 'react';

import './ModelSelectionItem.css';

interface Props {
	onClick: () => void;
	backgroundImageUrl: string;
	modelName: string;
}

export class ModelSelectionItem extends Component<Props> {
	render() {
		return (
			<div onClick={this.props.onClick} className='model-selection-item'>
				<div
					className='model-item-preview'
					style={{
						backgroundImage: `url('${this.props.backgroundImageUrl}')`,
					}}></div>

				<div className='model-item-description'>{this.props.modelName}</div>
			</div>
		);
	}
}
