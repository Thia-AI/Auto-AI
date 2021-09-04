import React from 'react';

import { Flex } from '@chakra-ui/react';
import { LabelsList } from './LabelsList';

export const DatasetPreview = React.memo(() => {
	return (
		<Flex w='full' flexDir='row' borderRadius='sm' h='525px' bg='gray.750'>
			<LabelsList />
		</Flex>
	);
});
