import React, { Component } from 'react';
import { CreateModelButton } from '../buttons/create-model/CreateModelButton';

import './NewModel.css';
interface Props {
	toggleCreatingModel: () => void;
}
export class NewModel extends Component<Props> {
	render() {
		return (
			<div id='new-model'>
				<CreateModelButton onClick={this.props.toggleCreatingModel} />
			</div>
		);
	}
}
