import React, { Component } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { IconProp } from '@fortawesome/fontawesome-svg-core';
import './BaseButton.css';

interface BaseButtonPropsCommon {
	text: string;
}

type TruncateProps =
	| { wantIcon?: false; icon?: never }
	| { wantIcon: true; icon: IconProp };

type BaseButtonProps = BaseButtonPropsCommon & TruncateProps;

export class BaseButton extends Component<BaseButtonProps> {
	constructor(props) {
		super(props);
	}

	state = {};
	render() {
		let { wantIcon } = this.props;
		let icon;
		if (wantIcon) {
			icon = <FontAwesomeIcon icon={this.props.icon as IconProp} />;
		}
		return (
			<button>
				{icon}
				{this.props.text}
			</button>
		);
	}
}
