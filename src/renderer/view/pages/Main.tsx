import React, { Component } from 'react';
import { Center } from '@chakra-ui/react';

import { NewModel } from '_/renderer/view/components/new-model/NewModel';
import { ModelSelection } from '_/renderer/view/components/model-selection/ModelSelection';

/**
 * Component for main portion of **renderer**
 */
class Main extends Component {
	constructor(props) {
		super(props);
	}

	render() {
		return (
			<Center w='full' h='full' overflowY='auto' marginTop='var(--header-height)'>
				<NewModel />
				<ModelSelection />
			</Center>
		);
	}
}

export default Main;
