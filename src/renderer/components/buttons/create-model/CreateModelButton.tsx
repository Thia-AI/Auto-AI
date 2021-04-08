import React, { Component } from 'react';
import { faPlusSquare as square } from '@fortawesome/free-solid-svg-icons';
import { faPlusSquare } from '@fortawesome/free-regular-svg-icons';
import { BaseButton } from '../base/BaseButton';

import './CreateModelButton.css';

export class CreateModelButton extends Component {
	private baseButton: React.RefObject<BaseButton>;

	constructor(props) {
		super(props);
		this.baseButton = React.createRef<BaseButton>();
	}
	render() {
		return (
			<BaseButton
				ref={this.baseButton}
				text='Create Model'
				wantIcon={true}
				icon={square}
				pull={'left'}
				className='button-icon'
				size='lg'
			/>
		);
	}
}
