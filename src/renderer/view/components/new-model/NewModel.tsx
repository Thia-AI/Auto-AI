import React, { Component } from 'react';
import { connect } from 'react-redux';
import {
	changeSelectedModelAction,
	openCloseModelSelectionAction,
} from '_/renderer/state/choose-model/ChooseModelActions';
import {
	IChangeSelectedModelAction,
	IOpenCloseModelSelectionAction,
} from '_/renderer/state/choose-model/model/actionTypes';
import { CreateModelButton } from '../buttons/create-model/CreateModelButton';

import './NewModel.css';
interface Props {
	openCloseModelSelectionAction: () => IOpenCloseModelSelectionAction;
	changeSelectedModel: (modelNumber: number) => IChangeSelectedModelAction;
}
class NewModel extends Component<Props> {
	render() {
		return (
			<div id='new-model'>
				<CreateModelButton
					onClick={() => {
						// reset selected model first
						this.props.changeSelectedModel(0);
						this.props.openCloseModelSelectionAction();
					}}
				/>
			</div>
		);
	}
}

const mapStateToProps = () => {
	return {};
};

export default connect(mapStateToProps, {
	openCloseModelSelectionAction,
	changeSelectedModel: changeSelectedModelAction,
})(NewModel);
