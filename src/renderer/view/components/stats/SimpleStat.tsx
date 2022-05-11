import React from 'react';
import ReactTooltip from 'react-tooltip';
import {
	Box,
	Heading,
	HStack,
	Icon,
	Link,
	Spacer,
	Stack,
	Text,
	useBreakpointValue,
	useColorModeValue,
} from '@chakra-ui/react';
import { BiHelpCircle } from 'react-icons/bi';
import './SimpleStat.css';

interface Props {
	label: string;
	value: string | number;
	statDescription: string;
	statTitle: string;
	percentage?: boolean;
}

/**
 * Displays a statistic.
 */
export const SimpleStat = React.memo(({ label, value, percentage = false, statDescription, statTitle }: Props) => {
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
					<Icon
						data-tip
						data-for={`evaluationMetric-${label}-tooltip`}
						fontSize='xl'
						transform='translateY(-7px)'
						color='gray.300'
						cursor='pointer'
						as={BiHelpCircle}
					/>
					<ReactTooltip
						id={`evaluationMetric-${label}-tooltip`}
						className='tooltip'
						delayHide={500}
						effect='solid'
						place='top'>
						<Box maxW='300px'>
							<Heading size='sm'>{statTitle}</Heading>
							<Text pt='1.5' fontWeight='thin'>
								{statDescription}
							</Text>
							{/* // TODO: Change this URL to a prop that redirects to thia documentation for that specific metric */}
							<Link href='https://google.ca'>Learn more</Link>
						</Box>
					</ReactTooltip>
				</HStack>

				<Heading size={useBreakpointValue({ base: 'sm', md: 'md' })}>
					{percentage ? `${value} %` : value}
				</Heading>
			</Stack>
		</Box>
	);
});

SimpleStat.displayName = 'SimpleStat';
