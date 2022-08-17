import React from 'react';
import { Icon } from '@chakra-ui/react';
import { IoMenuOutline } from 'react-icons/io5';
import { connect } from 'react-redux';

import { openCloseSideMenu } from '_state/side-menu/SideModelAction';
import { IMenuOpenCloseAction } from '_/renderer/state/side-menu/model/actionTypes';

interface Props {
	openCloseSideMenu: () => IMenuOpenCloseAction;
}

const HamburgerC = React.memo((props: Props) => {
	return (
		<Icon
			css={{ '-webkit-app-region': 'no-drag' }}
			transition='all 200ms'
			color='thia.gray.100'
			_hover={{ color: 'thia.purple.400', transform: 'scale(1.1)' }}
			w={6}
			h={6}
			as={IoMenuOutline}
			onClick={props.openCloseSideMenu}
		/>
	);
});

HamburgerC.displayName = 'Hamburger';

const mapStateToProps = () => ({});

/**
 * Hamburger icon that opens the side menu.
 */
export const Hamburger = connect(mapStateToProps, { openCloseSideMenu })(HamburgerC);
