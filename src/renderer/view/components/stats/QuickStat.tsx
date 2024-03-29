import { Box, Heading, Text, BoxProps, HStack } from '@chakra-ui/react';
import * as React from 'react';

interface Props extends BoxProps {
	label: string;
	value: string | number | undefined;
}

/**
 * Compoenent that renders a single quick stat on the dashboard.
 */
export const QuickStat = React.memo(({ label, value, ...boxProps }: Props) => {
	return (
		<Box px='3' py='1.5' borderRadius='lg' w='full' {...boxProps}>
			<HStack justify='space-between' w='full'>
				<Text fontSize='sm' color='muted'>
					{label}:
				</Text>
				<Heading as='h4' size='sm' userSelect='text'>
					{value}
				</Heading>
			</HStack>
		</Box>
	);
});

QuickStat.displayName = 'QuickStat';
