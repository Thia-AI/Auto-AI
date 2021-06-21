import { Center } from '@chakra-ui/react';
import React from 'react';
import { useRouteMatch } from 'react-router-dom';

const Model = () => {
	const modelID = useRouteMatch().params['id'];
	console.log(modelID);
	return (
		<Center w='full' h='full' marginTop='var(--header-height)' pt='4' overflowY='auto'>
			Model: {modelID}
		</Center>
	);
};

export default Model;
