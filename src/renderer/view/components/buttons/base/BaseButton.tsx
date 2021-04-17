import React, { Component } from 'react';
import { FontAwesomeIcon, FontAwesomeIconProps } from '@fortawesome/react-fontawesome';
import { IconProp } from '@fortawesome/fontawesome-svg-core';
import './BaseButton.css';

// Common props needed
interface BaseButtonPropsCommon {
	text: string;
	onClick: () => void;
}

// Copy FontAwesomeIconProps without icon as we will add conditions for icon existing
// or not later
interface OmitIcon extends Omit<FontAwesomeIconProps, 'icon'> {}

// Combine with common props
type BaseButtonPropsOmmited = BaseButtonPropsCommon & OmitIcon;

// Icon conditions: If we want an icon then it must be provided else it assumes
// you don't want an icon and thus don't have to provide it

type TruncateProps =
	| { wantIcon?: false; icon?: never }
	| { wantIcon: true; icon: IconProp };

// Combine all
type BaseButtonProps = BaseButtonPropsOmmited & TruncateProps;

export class BaseButton extends Component<BaseButtonProps> {
	constructor(props) {
		super(props);
	}

	render() {
		let { wantIcon } = this.props;
		let icon;
		if (wantIcon) {
			icon = (
				<FontAwesomeIcon
					icon={this.props.icon as IconProp}
					mask={this.props.mask}
					className={this.props.className}
					color={this.props.color}
					spin={this.props.spin}
					pulse={this.props.pulse}
					border={this.props.border}
					fixedWidth={this.props.fixedWidth}
					inverse={this.props.inverse}
					listItem={this.props.listItem}
					flip={this.props.flip}
					size={this.props.size}
					pull={this.props.pull}
					rotation={this.props.rotation}
					transform={this.props.transform}
					symbol={this.props.symbol}
					style={this.props.style}
					tabIndex={this.props.tabIndex}
					title={this.props.title}
					swapOpacity={this.props.swapOpacity}
				/>
			);
		}
		return (
			<div className='button' onClick={this.props.onClick}>
				{icon}
				<div className='button-text'>{this.props.text}</div>
			</div>
		);
	}
}
