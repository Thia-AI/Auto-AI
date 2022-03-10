import React from 'react';

import { Box, useRadio, UseRadioProps } from '@chakra-ui/react';

interface Props extends UseRadioProps {
	children?: React.ReactNode;
}

/**
 * Radio card for selecting the model type when creating a new image classification model.
 */
export const ICModelRadioCard = React.memo((props: Props) => {
	const { getInputProps, getCheckboxProps } = useRadio(props);

	const input = getInputProps();
	const checkbox = getCheckboxProps();

	return (
		<Box as='label' position='relative' w='full'>
			<input
				{...input}
				onClick={(e) => {
					e.preventDefault();
				}}
			/>
			<Box
				{...checkbox}
				cursor='pointer'
				borderWidth='1px'
				borderRadius='sm'
				h='50px'
				_checked={{
					bg: 'teal.600',
					color: 'white',
					borderColor: 'teal.600',
				}}
				_focus={{
					boxShadow: 'outline',
				}}
				px={1}
				py={2}>
				{props.children}
			</Box>
		</Box>
	);
});

ICModelRadioCard.displayName = 'RadioCard';
