import React, { useEffect, useState } from 'react';
import { Center } from '@chakra-ui/react';
import { EngineActionHandler } from '_engine_requests/engineActionHandler';

export const Models = () => {
	const [models, setModels] = useState([]);

	useEffect(() => {
		const fetchModels = async () => {
			const [error, resData] = await EngineActionHandler.getInstance().getModels();
			if (!error) {
				console.log(resData['models']);
				setModels(resData['models']);
			}
		};

		fetchModels();
	}, []);

	return (
		<Center w='full' h='full'>
			Models
		</Center>
	);
};
