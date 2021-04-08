import React, { Component } from 'react';
import { CSSTransition } from 'react-transition-group';
import { Modal } from '../modal/Modal';

import './ModelSelection.css';

interface Props {
	toggleModelState: boolean;
}

export class ModelSelection extends Component<Props> {
	render() {
		return (
			<CSSTransition
				in={this.props.toggleModelState}
				timeout={300}
				classNames='toggle-select-model'
				unmountOnExit>
				<Modal opacity={0.2}>
					<div>AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA</div>
				</Modal>
			</CSSTransition>
		);
	}
}
