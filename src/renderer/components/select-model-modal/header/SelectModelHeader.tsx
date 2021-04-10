import React, { Component } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTimesCircle } from '@fortawesome/free-solid-svg-icons';

import './SelectModelHeader.css';

interface Props {
	exitMethod: () => void;
}

export class SelectModelHeader extends Component<Props> {
	render() {
		return (
			<React.Fragment>
				<div className='select-model-header-info'>
					<h2 className='header-name'>Select a Model</h2>
				</div>
				<div className='header-actions'>
					<FontAwesomeIcon
						icon={faTimesCircle}
						pull='left'
						className='exit-icon'
						size='lg'
						onClick={this.props.exitMethod}
					/>
				</div>
			</React.Fragment>
		);
	}
}
