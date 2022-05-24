import { Box, Heading, Stack, useColorModeValue as mode } from '@chakra-ui/react';
import { NavItem as _NavItem } from './NavItem';
import * as React from 'react';

interface NavGroupProps {
	label: string;
	children: React.ReactNode;
}

/**
 * Holds group of related {@link _NavItem `NavItems`} in the side menu.
 */
export const NavGroup = React.memo((props: NavGroupProps) => {
	const color = mode('thia.gray.400', 'thia.gray.200');
	const { label, children } = props;
	return (
		<Box>
			<Heading
				as='h4'
				px='3'
				fontSize='xs'
				textTransform='uppercase'
				letterSpacing='wider'
				fontWeight='medium'
				color={color}
				mb='3'>
				{label}
			</Heading>
			<Stack spacing='1'>{children}</Stack>
		</Box>
	);
});

NavGroup.displayName = 'NavGroup';
