import { Box, Stack, Text } from '@chakra-ui/react';
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
	const { label, children } = props;
	return (
		<Box>
			<Text
				px='3'
				fontSize='xs'
				fontWeight='semibold'
				textTransform='uppercase'
				letterSpacing='widest'
				color='gray.500'
				mb='3'>
				{label}
			</Text>
			<Stack spacing='1'>{children}</Stack>
		</Box>
	);
});
