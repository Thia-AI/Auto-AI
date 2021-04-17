import React, { Component } from 'react';

import './InnerModalHeader.css';

export class InnerModalHeader extends Component {
	render() {
		return <div className='inner-modal-header'>{this.props.children}</div>;
	}
}
