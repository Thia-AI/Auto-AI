import { Box, HStack, useColorModeValue } from '@chakra-ui/react';
import * as React from 'react';
import { BsCaretRightFill } from 'react-icons/bs';

interface NavItemProps {
	href?: string;
	label: string;
	subtle?: boolean;
	active?: boolean;
	icon: React.ReactElement;
	endElement?: React.ReactElement;
	children?: React.ReactNode;
	// eslint-disable-next-line  @typescript-eslint/no-explicit-any
	onClick: () => any;
}

/**
 * Individual navigation item in the side menu.
 */
export const NavItem = React.memo((props: NavItemProps) => {
	const { active, subtle, icon, children, label, endElement } = props;
	const navItemBackground = useColorModeValue('thia.purple.350', 'thia.purple.350');
	const navItemActive = useColorModeValue('thia.purple.300', 'thia.purple.300');
	return (
		<HStack
			w='full'
			onClick={props.onClick}
			px='3'
			py='2'
			cursor='pointer'
			userSelect='none'
			rounded='md'
			color={active ? 'currentcolor' : 'thia.gray.300'}
			transition='all 0.2s'
			bg={active ? navItemBackground : undefined}
			_hover={{ bg: navItemBackground, color: 'currentcolor' }}
			_active={{ bg: navItemActive }}>
			<Box fontWeight='light' fontSize='lg'>
				{icon}
			</Box>
			<Box
				pl='1'
				flex='1'
				fontWeight='thin'
				color={active ? 'currentcolor' : subtle ? 'thia.gray.300' : undefined}>
				{label}
			</Box>
			{endElement && !children && <Box>{endElement}</Box>}
			{children && <Box fontSize='xs' flexShrink={0} as={BsCaretRightFill} />}
		</HStack>
	);
});

NavItem.displayName = 'NavItem';
