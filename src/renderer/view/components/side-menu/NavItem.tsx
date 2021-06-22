import { Box, HStack } from '@chakra-ui/react';
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

export const NavItem = React.memo((props: NavItemProps) => {
	const { active, subtle, icon, children, label, endElement } = props;
	return (
		<HStack
			w='full'
			onClick={props.onClick}
			px='3'
			py='2'
			cursor='pointer'
			userSelect='none'
			rounded='md'
			transition='all 0.2s'
			bg={active ? 'gray.700' : undefined}
			_hover={{ bg: 'gray.700' }}
			_active={{ bg: 'gray.600' }}>
			<Box fontWeight='light' fontSize='lg' color={active ? 'currentcolor' : 'gray.400'}>
				{icon}
			</Box>
			<Box pl='1' flex='1' fontWeight='thin' color={subtle ? 'gray.400' : undefined}>
				{label}
			</Box>
			{endElement && !children && <Box>{endElement}</Box>}
			{children && <Box fontSize='xs' flexShrink={0} as={BsCaretRightFill} />}
		</HStack>
	);
});
