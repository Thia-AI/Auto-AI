import React from 'react';
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

const NewModelC = (props: Props) => {
	return (
		<Center w='50%' h='50%'>
			<Button
				variant='outline'
				colorScheme='teal'
				onClick={() => {
					props.changeSelectedModel(0);
					props.openCloseModelSelectionAction();
				}}>
				Create Model
			</Button>
		</Center>
	);
};

const mapStateToProps = () => {
	return {};
};

export const NewModel = connect(mapStateToProps, {
	openCloseModelSelectionAction,
	changeSelectedModel: changeSelectedModelAction,
})(NewModelC);
