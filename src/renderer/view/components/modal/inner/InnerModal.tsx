import React, { Component } from 'react';

import './InnerModal.css';

export class InnerModal extends Component {
	render() {
		return (
			<div
				className='inner-modal-div inner-modal-div-shadow'
				// stop parent's onclick from being called
				onClick={(e) => e.stopPropagation()}>
				{this.props.children}
			</div>
		);
	}
}
