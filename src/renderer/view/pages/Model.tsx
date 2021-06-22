import React, { useEffect } from 'react';

import {
	Center,
	Box,
	VStack,
	Text,
	HStack,
	Badge,
	Skeleton,
	useColorModeValue as mode,
	useMediaQuery,
	Spacer,
	Button,
} from '@chakra-ui/react';
import { useState } from 'react';
import { useRouteMatch } from 'react-router-dom';

import { getVerboseModelType } from '_view_helpers/modelHelper';
import { EngineActionHandler } from '_engine_requests/engineActionHandler';
import { HorizontalDatasetPreview } from '../components/datasets/model-horizontal/HorizontalDatasetPreview';

const Model = React.memo(() => {
	const modelID = useRouteMatch().params['id'];
	const [model, setModel] = useState({});

	useEffect(() => {
		const fetchModel = async () => {
			const [error, resData] = await EngineActionHandler.getInstance().getModel(modelID);
			if (!error) {
				console.log(resData);
				setModel(resData);
			}
		};

		fetchModel();
	}, []);
	return (
		<VStack
			py='2'
			px='6'
			w='full'
			spacing='4'
			h='full'
			alignItems='flex-start'
			marginTop='var(--header-height)'
			pt='4'>
			<Skeleton w='400px' mb='6' isLoaded={Object.keys(model).length != 0}>
				<HStack pt='1' alignItems='center'>
					<Text pb='1' as='h3' fontWeight='bold' fontSize='lg' isTruncated ml='4'>
						{model['model_name']}:
					</Text>
					<Badge fontSize='sm' colorScheme='purple' ml='1'>
						{getVerboseModelType(model['model_type'])}
					</Badge>
				</HStack>
			</Skeleton>
			<HorizontalDatasetPreview modelType={model['model_type']} />
			<Spacer />
			<Center w='full'>
				<Button colorScheme='blue'>Train</Button>
			</Center>
		</VStack>
	);
});

export default Model;
