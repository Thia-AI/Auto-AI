import React, { useEffect, useState } from 'react';

import {
	Box,
	HStack,
	Skeleton,
	VStack,
	Text,
	Badge,
	Spacer,
	useMediaQuery,
	useColorModeValue as mode,
} from '@chakra-ui/react';
import { useRouteMatch } from 'react-router-dom';

import { EngineActionHandler } from '_engine_requests/engineActionHandler';
import { Dataset } from '_view_helpers/constants/engineDBTypes';
import { getVerboseModelType } from '../helpers/modelHelper';
import { InteractiveCopyBadge } from '../components/interactive/InteractiveCopyBadge';
import { DragNDrop } from '../components/datasets/drag-n-drop/DragNDrop';

const Dataset = React.memo(() => {
	const datasetID = useRouteMatch().params['id'];
	const [dataset, setDataset] = useState<Dataset | undefined>(undefined);

	const [isLargerThan1280] = useMediaQuery('(min-width: 1280px)');

	useEffect(() => {
		const fetchDataset = async () => {
			const [error, resData] = await EngineActionHandler.getInstance().getDataset(datasetID);
			if (!error) {
				setDataset(resData);
			}
		};

		fetchDataset();
	}, []);

	return (
		<VStack
			py='2'
			px='6'
			spacing='4'
			alignItems='flex-start'
			w='full'
			h='full'
			marginTop='var(--header-height)'
			overflowY='auto'
			sx={{
				'&::-webkit-scrollbar': {
					w: '10px',
					bg: 'gray.600',
				},
				'&::-webkit-scrollbar-thumb': {
					bg: 'gray.900',
				},
			}}>
			<VStack alignItems='flex-start' ml='4'>
				<Skeleton w='400px' isLoaded={dataset !== undefined}>
					<HStack pt='1' alignItems='center'>
						<Text pb='1' as='h3' fontWeight='bold' fontSize='lg' isTruncated>
							{dataset?.name}:
						</Text>
						<Badge fontSize='sm' colorScheme='purple' ml='1'>
							{getVerboseModelType(dataset?.type)}
						</Badge>
					</HStack>
				</Skeleton>
				<InteractiveCopyBadge badgeID={dataset?.id} />
			</VStack>
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
						Upload Images
					</Text>
					<Text color='gray.500' fontSize='sm'>
						Select images to transfer to dataset
					</Text>
				</Box>
				<DragNDrop dataset={dataset} />
			</Box>
			<Spacer />
		</VStack>
	);
});

export default Dataset;
