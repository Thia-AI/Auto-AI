import React, { useEffect, useState } from 'react';
import { Box, VStack } from '@chakra-ui/react';
import { EngineActionHandler } from '_engine_requests/engineActionHandler';
import { ModelCard } from '../components/model-card/ModelCard';

export const Models = () => {
	const [models, setModels] = useState([]);
	const [isLoaded, setIsLoaded] = useState(false);

	useEffect(() => {
		const fetchModels = async () => {
			const [error, resData] = await EngineActionHandler.getInstance().getModels();
			setIsLoaded(true);
			if (!error) {
				console.log(resData['models']);
				setModels(resData['models']);
			}
		};

		fetchModels();
	}, []);
	const renderSkeleton = () => {
		return Array(8)
			.fill('')
			.map((_, i) => {
				return (
					<ModelCard
						key={i}
						isLoaded={false}
						modelTitle=''
						modelStatus=''
						dateLastAccessed=''
					/>
				);
			});
	};

	const renderModels = () => {
		return models.map((model) => {
			return (
				<ModelCard
					key={model['id']}
					isLoaded={true}
					modelTitle={model['model_name']}
					modelStatus='IDLE'
					dateLastAccessed='69/69/6969'
				/>
			);
		});
	};

	const render = () => {
		if (isLoaded) {
			return renderModels();
		} else return renderSkeleton();
	};
	return (
		<Box
			w='full'
			h='full'
			marginTop='var(--header-height)'
			pt='4'
			overflowY='auto'
			sx={{
				'&::-webkit-scrollbar': {
					width: '10px',
					backgroundColor: 'gray.700',
				},
				'&::-webkit-scrollbar-thumb': {
					backgroundColor: 'gray.900',
				},
				'&::-webkit-scrollbar-thumb:hover': {
					backgroundColor: 'gray.900',
				},
			}}>
			<VStack spacing='2'>{render()}</VStack>
		</Box>
	);
};
