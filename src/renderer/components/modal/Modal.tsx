import React, { Component } from 'react';

import './Modal.css';

interface Props {
	opacity: number;
}

export class Modal extends Component<Props> {
	render() {
		return (
			<div
				className='modal'
				style={{ backgroundColor: `rgba(0, 0, 0, ${this.props.opacity})` }}>
				{this.props.children}
			</div>
		);
	}
}
