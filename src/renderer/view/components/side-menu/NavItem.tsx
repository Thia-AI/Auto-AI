import { Box, HStack, useColorModeValue } from '@chakra-ui/react';
import * as React from 'react';
import { BsCaretRightFill } from 'react-icons/bs';

interface NavItemProps {
	href?: string;
	label: string;
	active?: boolean;
	used?: boolean;
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
	const { active, icon, children, label, endElement, used } = props;
	const navItemBGActive = useColorModeValue('thia.purple.250', 'thia.purple.350');
	const navItemBGClicking = useColorModeValue('thia.purple.200', 'thia.purple.300');
	const color = useColorModeValue('thia.gray.700', 'thia.gray.100');
	const colorActive = useColorModeValue('thia.gray.850', 'thia.gray.50');
	return (
		<HStack
			opacity={used ? 1.0 : 0.2}
			w='full'
			onClick={used ? props.onClick : undefined}
			title={used ? '' : 'Unavailable Route'}
			px='3'
			py='2'
			cursor={used ? 'pointer' : 'not-allowed'}
			userSelect='none'
			rounded='md'
			color={active ? colorActive : color}
			transition='all 0.2s'
			bg={active ? navItemBGActive : undefined}
			_hover={used ? { bg: navItemBGActive, color: colorActive } : { bg: undefined, color: undefined }}
			_active={used ? { bg: navItemBGClicking } : {}}>
			<Box fontWeight='light' fontSize='lg'>
				{icon}
			</Box>
			<Box pl='1' flex='1' fontWeight='thin' color={active ? colorActive : color}>
				{label}
			</Box>
			{endElement && !children && <Box>{endElement}</Box>}
			{children && <Box fontSize='xs' flexShrink={0} as={BsCaretRightFill} />}
		</HStack>
	);
});

NavItem.displayName = 'NavItem';
