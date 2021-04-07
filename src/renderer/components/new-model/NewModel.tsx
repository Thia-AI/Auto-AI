import React, { Component } from 'react';
import { CreateModelButton } from '../buttons/create-model/CreateModelButton';

import './NewModel.css';

export class NewModel extends Component {
	render() {
		return (
			<div id='new-model'>
				<CreateModelButton />
			</div>
		);
	}
}
