import React from 'react';
import { Box, Text, useColorModeValue } from '@chakra-ui/react';

interface Props {
	error: string;
	isError: boolean;
}
export const EditableModelNameError = React.memo(({ isError, error }: Props) => {
	const color = useColorModeValue('red.600', 'red.400');
	return isError ? (
		<Text mt='3' color={color} fontSize='13px' noOfLines={2} maxW='200px'>
			{error}
		</Text>
	) : null;
});
