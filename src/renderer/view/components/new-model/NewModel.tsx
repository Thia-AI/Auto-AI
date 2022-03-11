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

const NewModelC = React.memo((props: Props) => {
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
});

NewModelC.displayName = 'NewModel';

const mapStateToProps = () => {
	return {};
};

/**
 * Adding a new model.
 */
export const NewModel = connect(mapStateToProps, {
	openCloseModelSelectionAction,
	changeSelectedModel: changeSelectedModelAction,
})(NewModelC);
