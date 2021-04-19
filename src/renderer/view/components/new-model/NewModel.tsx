import React, { Component } from 'react';
import { connect } from 'react-redux';
import { openCloseModelSelectionAction } from '_/renderer/state/choose-model/ChooseModelActions';
import { IOpenCloseModelSelectionAction } from '_/renderer/state/choose-model/model/actionTypes';
import { CreateModelButton } from '../buttons/create-model/CreateModelButton';

import './NewModel.css';
interface Props {
	openCloseModelSelectionAction: () => IOpenCloseModelSelectionAction;
}
class NewModel extends Component<Props> {
	render() {
		return (
			<div id='new-model'>
				<CreateModelButton onClick={this.props.openCloseModelSelectionAction} />
			</div>
		);
	}
}

const mapStateToProps = () => {
	return {};
};

export default connect(mapStateToProps, {
	openCloseModelSelectionAction,
})(NewModel);
