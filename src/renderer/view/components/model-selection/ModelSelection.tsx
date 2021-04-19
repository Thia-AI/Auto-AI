import React, { Component } from 'react';
import { CSSTransition } from 'react-transition-group';
import { SimpleDivider } from '../divider/SimpleDivider';
import { InnerModalContent } from '../modal/inner/content/InnerModalContent';
import { InnerModalHeader } from '../modal/inner/header/InnerModalHeader';
import { InnerModal } from '../modal/inner/InnerModal';
import { Modal } from '../modal/Modal';
import SelectModelContent from '../select-model-modal/content/SelectModelContent';
import { SelectModelHeader } from '../select-model-modal/header/SelectModelHeader';
import { openCloseModelSelectionAction } from '_/renderer/state/choose-model/ChooseModelActions';

import './ModelSelection.css';
import { connect } from 'react-redux';
import { IAppState } from '_/renderer/state/reducers';
import { IOpenCloseModelSelectionReducer } from '_/renderer/state/choose-model/model/reducerTypes';
import { ThunkAction } from 'redux-thunk';
import { IOpenCloseModelSelectionAction } from '_/renderer/state/choose-model/model/actionTypes';

interface Props {
	modalOpenedState: IOpenCloseModelSelectionReducer;
	openCloseModelSelectionAction: () => IOpenCloseModelSelectionAction;
}

class ModelSelection extends Component<Props> {
	render() {
		return (
			<CSSTransition
				in={this.props.modalOpenedState.value}
				timeout={300}
				classNames='toggle-select-model'
				unmountOnExit>
				<Modal
					opacity={0.2}
					modalClick={this.props.openCloseModelSelectionAction}>
					<InnerModal>
						<InnerModalHeader>
							<SelectModelHeader
								exitMethod={() =>
									this.props.openCloseModelSelectionAction()
								}
							/>
						</InnerModalHeader>
						<SimpleDivider />
						<InnerModalContent>
							<SelectModelContent />
						</InnerModalContent>
					</InnerModal>
				</Modal>
			</CSSTransition>
		);
	}
}

const mapStateToProps = (state: IAppState) => {
	return {
		modalOpenedState: state.openCloseModelSelection,
	};
};

export default connect(mapStateToProps, {
	openCloseModelSelectionAction,
})(ModelSelection);
