import React, { Component } from 'react';
import { CSSTransition } from 'react-transition-group';
import { InnerModalContent } from '../modal/inner/content/InnerModalContent';
import { InnerModalHeader } from '../modal/inner/header/InnerModalHeader';
import { InnerModal } from '../modal/inner/InnerModal';
import { Modal } from '../modal/Modal';
import { SelectModelContent } from '../select-model-modal/content/SelectModelContent';
import { SelectModelHeader } from '../select-model-modal/header/SelectModelHeader';

import './ModelSelection.css';

interface Props {
	modelSelectionState: boolean;
	toggleCreatingModel: () => void;
}

export class ModelSelection extends Component<Props> {
	render() {
		return (
			<CSSTransition
				in={this.props.modelSelectionState}
				timeout={300}
				classNames='toggle-select-model'
				unmountOnExit>
				<Modal opacity={0.2} modalClick={this.props.toggleCreatingModel}>
					<InnerModal>
						<InnerModalHeader>
							<SelectModelHeader />
						</InnerModalHeader>

						<InnerModalContent>
							<SelectModelContent />
						</InnerModalContent>
					</InnerModal>
				</Modal>
			</CSSTransition>
		);
	}
}
