import React, { Component } from 'react';

import './Modal.css';

interface Props {
	opacity: number;
	insideParent?: true;
	className?: string;
	modalClick?: () => void;
}

export class Modal extends Component<Props> {
	render() {
		return (
			<div
				className={`
					modal 
					${this.props.className} 
					${this.props.insideParent ? 'modal-inside-parent' : ''}
				`}
				style={{ backgroundColor: `rgba(0, 0, 0, ${this.props.opacity})` }}
				onClick={this.props.modalClick}>
				{this.props.children}
			</div>
		);
	}
}
