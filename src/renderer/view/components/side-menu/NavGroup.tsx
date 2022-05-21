import { Box, Heading, Stack, Text, useColorModeValue as mode } from '@chakra-ui/react';
import { NavItem } from './NavItem'; // eslint-disable-line @typescript-eslint/no-unused-vars
import * as React from 'react';

interface NavGroupProps {
	label: string;
	children: React.ReactNode;
}

/**
 * Holds group of related {@link NavItem `NavItems`} in the side menu.
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
