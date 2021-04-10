import React, { Component } from 'react';

import './InnerModalContent.css';

export class InnerModalContent extends Component {
	render() {
		return <div className='inner-modal-content'>{this.props.children}</div>;
	}
}
