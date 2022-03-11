import React from 'react';
import {
	Box,
	Heading,
	HStack,
	Icon,
	Spacer,
	Stack,
	Text,
	useBreakpointValue,
	useColorModeValue,
} from '@chakra-ui/react';
import { BiHelpCircle } from 'react-icons/bi';

interface Props {
	label: string;
	value: string | number;
	percentage?: boolean;
}

/**
 * Displays a statistic.
 */
export const SimpleStat = React.memo(({ label, value, percentage = false }: Props) => {
	return (
		<Box
			minW={225}
			bg='gray.800'
			pl={{ base: '4', lg: '7' }}
			pr={{ base: '1.5', lg: '3' }}
			py={{ base: '3', lg: '4' }}
			borderRadius='lg'
			boxShadow={useColorModeValue('sm', 'sm-dark')}>
			<Stack>
				<HStack w='full'>
					<Text fontSize='sm' color='muted'>
						{label}
					</Text>
					<Spacer />
					<Icon fontSize='2xl' transform='translateY(-7px)' color='gray.300' as={BiHelpCircle} />
				</HStack>

				<Heading size={useBreakpointValue({ base: 'sm', md: 'md' })}>
					{percentage ? `${value} %` : value}
				</Heading>
			</Stack>
		</Box>
	);
});

SimpleStat.displayName = 'SimpleStat';
