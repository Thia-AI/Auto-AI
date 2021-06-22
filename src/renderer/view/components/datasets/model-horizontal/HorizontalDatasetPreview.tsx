import React from 'react';
import { Box, Text, useMediaQuery, useColorModeValue as mode } from '@chakra-ui/react';

import { getVerboseModelType } from '_view_helpers/modelHelper';

interface Props {
	modelType: string;
}
export const HorizontalDatasetPreview = React.memo((props: Props) => {
	const [isLargerThan1280] = useMediaQuery('(min-width: 1280px)');

	return (
		<Box
			w={isLargerThan1280 ? '90%' : 'full'}
			py='6'
			willChange='width'
			transition='width 200ms'
			alignSelf='center'
			px='8'
			rounded='lg'
			bg={mode('white', 'gray.700')}
			shadow='base'>
			<Box mb='8'>
				<Text as='h3' fontWeight='bold' fontSize='lg'>
					Datasets
				</Text>
				<Text color='gray.500' fontSize='sm'>
					Your datasets for {getVerboseModelType(props.modelType)}
				</Text>
			</Box>
		</Box>
	);
});
