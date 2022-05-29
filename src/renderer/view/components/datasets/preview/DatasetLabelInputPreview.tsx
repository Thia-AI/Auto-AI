import React from 'react';

import { Flex, useColorModeValue as mode } from '@chakra-ui/react';
import { LabelsList } from './labels/LabelsList';
import { DatasetInputPreview } from './input/DatasetInputPreview';

/**
 * Preview of a dataset's inputs and labels.
 */
export const DatasetLabelInputPreview = React.memo(() => {
	const bg = mode('thia.gray.100', 'thia.gray.750');
	const borderColor = mode('thia.gray.150', 'thia.gray.700');
	return (
		<Flex
			w='full'
			p='1'
			flexDir='row'
			borderRadius='sm'
			borderWidth='1px'
			borderColor={borderColor}
			h='575px'
			bg={bg}>
			<LabelsList />
			<DatasetInputPreview />
		</Flex>
	);
});

DatasetLabelInputPreview.displayName = 'DatasetLabelInputPreview';
