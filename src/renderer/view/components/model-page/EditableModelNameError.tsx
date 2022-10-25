import React from 'react';
import { Text, useColorModeValue } from '@chakra-ui/react';

interface Props {
	error: string;
	isError: boolean;
}

/**
 * Component that displays an editable input's error message.
 */
export const EditableModelNameError = React.memo(({ isError, error }: Props) => {
	const color = useColorModeValue('red.600', 'red.400');
	return isError ? (
		<Text mt='3' color={color} fontSize='13px' noOfLines={2} maxW='200px'>
			{error}
		</Text>
	) : null;
});

EditableModelNameError.displayName = 'EditableModelNameError';
