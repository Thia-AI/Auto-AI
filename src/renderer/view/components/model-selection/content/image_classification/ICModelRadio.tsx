import React from 'react';

import { Box, Heading, useRadio, UseRadioProps, Text, Link, useColorModeValue as mode } from '@chakra-ui/react';

interface Props extends UseRadioProps {
	children: React.ReactNode;
	description: string;
	isDisabled?: boolean;
	title?: string;
}

/**
 * Radio card for selecting the model type when creating a new image classification model.
 */
export const ICModelRadioCard = React.memo((props: Props) => {
	const { getInputProps, getCheckboxProps } = useRadio(props);

	const input = getInputProps();
	const checkbox = getCheckboxProps();
	const isDisabled = props.isDisabled;
	const color = mode('thia.gray.800', 'thia.gray.200');
	const cardBG = mode('thia.purple.400', 'thia.purple.400');

	return (
		<Box as='label' position='relative' w='250px' rounded='sm'>
			<input
				{...input}
				onClick={(e) => {
					e.preventDefault();
				}}
			/>
			<Box
				{...checkbox}
				opacity={isDisabled ? '0.4' : '1'}
				cursor={isDisabled ? 'not-allowed' : 'pointer'}
				borderWidth='1px'
				borderRadius='sm'
				h='125px'
				title={isDisabled ? props.title : ''}
				transition='all 200ms ease'
				willChange='transform'
				color={color}
				_hover={!isDisabled ? { transform: 'scale(1.05)' } : {}}
				_checked={{
					bg: cardBG,
					color: 'thia.gray.50',
					borderColor: cardBG,
					transform: 'scale(1.05)',
				}}
				_focus={{
					boxShadow: 'outline',
				}}
				px='3.5'
				py='2'>
				<Heading size='sm'>{props.children}</Heading>
				<Text mt='1' fontSize='13px' fontWeight='thin' as='p' maxW='250px' textAlign='left'>
					{props.description}
				</Text>
				{/* // TODO: Change this URL to a prop that redirects to thia documentation for that specific image classification model type */}
				<Link fontSize='xs' href='https://google.ca'>
					Learn more
				</Link>
			</Box>
		</Box>
	);
});

ICModelRadioCard.displayName = 'RadioCard';
