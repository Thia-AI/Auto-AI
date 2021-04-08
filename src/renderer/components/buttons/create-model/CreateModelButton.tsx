import React, { Component } from 'react';
import { faPlusSquare as square } from '@fortawesome/free-solid-svg-icons';
import { faPlusSquare } from '@fortawesome/free-regular-svg-icons';
import { BaseButton } from '../base/BaseButton';

import './CreateModelButton.css';

interface Props {
	onClick: () => void;
}

export class CreateModelButton extends Component<Props> {
	constructor(props) {
		super(props);
	}
	render() {
		return (
			<BaseButton
				text='Create Model'
				wantIcon={true}
				icon={square}
				pull={'left'}
				className='button-icon'
				size='lg'
				onClick={this.props.onClick}
			/>
		);
	}
}
