import React, { Component } from 'react';
import './Modal.css';

interface ModalProps {
	loader: JSX.Element;
}

class Modal extends Component<ModalProps> {
	constructor(props) {
		super(props);
	}
	render() {
		return <div className='modal'>{this.props.loader}</div>;
	}
}

export { Modal };
