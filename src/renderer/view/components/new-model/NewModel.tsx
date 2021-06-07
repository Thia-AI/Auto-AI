import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Button, Center } from '@chakra-ui/react';

import {
	changeSelectedModelAction,
	openCloseModelSelectionAction,
} from '_/renderer/state/choose-model/ChooseModelActions';
import {
	IChangeSelectedModelAction,
	IOpenCloseModelSelectionAction,
} from '_/renderer/state/choose-model/model/actionTypes';

import './NewModel.css';
interface Props {
	openCloseModelSelectionAction: () => IOpenCloseModelSelectionAction;
	changeSelectedModel: (modelNumber: number) => IChangeSelectedModelAction;
}
class NewModelC extends Component<Props> {
	render() {
		return (
			<Center w='50%' h='50%'>
				<Button
					colorScheme='purple'
					onClick={() => {
						this.props.changeSelectedModel(0);
						this.props.openCloseModelSelectionAction();
					}}>
					Create Model
				</Button>
			</Center>
		);
	}
}

const mapStateToProps = () => {
	return {};
};

export const NewModel = connect(mapStateToProps, {
	openCloseModelSelectionAction,
	changeSelectedModel: changeSelectedModelAction,
})(NewModelC);
