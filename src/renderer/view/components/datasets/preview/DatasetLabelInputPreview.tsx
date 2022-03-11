import React from 'react';

import { Flex } from '@chakra-ui/react';
import { LabelsList } from './labels/LabelsList';
import { DatasetInputPreview } from './input/DatasetInputPreview';

/**
 * Preview of a dataset's inputs and labels.
 */
export const DatasetLabelInputPreview = React.memo(() => {
	return (
		<Flex w='full' flexDir='row' borderRadius='sm' h='575px' bg='gray.750'>
			<LabelsList />
			<DatasetInputPreview />
		</Flex>
	);
});

DatasetLabelInputPreview.displayName = 'DatasetLabelInputPreview';
