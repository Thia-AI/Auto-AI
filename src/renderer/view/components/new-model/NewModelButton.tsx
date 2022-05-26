import React from 'react';
import { connect } from 'react-redux';
import { Button, Text, useBreakpointValue } from '@chakra-ui/react';

import {
	changeSelectedModelAction,
	openCloseModelSelectionAction,
} from '_/renderer/state/choose-model/ChooseModelActions';
import {
	IChangeSelectedModelAction,
	IOpenCloseModelSelectionAction,
} from '_/renderer/state/choose-model/model/actionTypes';

interface Props {
	openCloseModelSelectionAction: () => IOpenCloseModelSelectionAction;
	changeSelectedModel: (modelNumber: number) => IChangeSelectedModelAction;
}

const NewModelButtonC = React.memo((props: Props) => {
	const fontSize = useBreakpointValue({ base: 'xl', md: '4xl', lg: '6xl', '2xl': '8xl' });
	return (
		<Button
			variant='outline'
			w='full'
			h='full'
			colorScheme='thia.purple'
			minH='35px'
			onClick={() => {
				props.changeSelectedModel(0);
				props.openCloseModelSelectionAction();
			}}>
			<Text fontSize={fontSize}>Create Model</Text>
		</Button>
	);
});

NewModelButtonC.displayName = 'NewModelButton';

const mapStateToProps = () => {
	return {};
};

/**
 * Adding a new model.
 */
export const NewModelButton = connect(mapStateToProps, {
	openCloseModelSelectionAction,
	changeSelectedModel: changeSelectedModelAction,
})(NewModelButtonC);
