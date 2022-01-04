import { Box } from '@chakra-ui/react';
import React from 'react';

/**
 * Preview of a dataset's inputs (images).
 */
export const InputPreview = React.memo(() => {
	return (
		<Box
			w='full'
			h='full'
			ml='2'
			borderTopRightRadius='sm'
			borderBottomRightRadius='sm'
			overflow='hidden'>
			<Box w='full' h='70%' bg='red.400'></Box>
			<Box w='full' h='full' mt='2' bg='blue.400'></Box>
		</Box>
	);
});
