import React from 'react';

import { Flex } from '@chakra-ui/react';
import { LabelsList } from './label-list/LabelsList';
import { InputPreview } from './input-preview/InputPreview';

export const DatasetPreview = React.memo(() => {
	return (
		<Flex w='full' flexDir='row' borderRadius='sm' h='575px' bg='gray.750'>
			<LabelsList />
			<InputPreview />
		</Flex>
	);
});
