import React, { Component } from 'react';
import { Box } from '@chakra-ui/react';

import './Main.css';
import { NewModel } from '_/renderer/view/components/new-model/NewModel';
import { ModelSelection } from '_/renderer/view/components/model-selection/ModelSelection';

/**
 * Component for main portion of **renderer**
 */
export class Main extends Component {
	constructor(props) {
		super(props);
	}

	render() {
		return (
			<Box className='headerless-app'>
				<NewModel />
				<ModelSelection />
			</Box>
		);
	}
}
