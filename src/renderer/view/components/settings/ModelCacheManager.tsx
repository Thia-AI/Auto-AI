import {
	Flex,
	HStack,
	Heading,
	Spacer,
	Icon,
	useColorModeValue as mode,
	Box,
	VStack,
	Link,
	Spinner,
	Center,
} from '@chakra-ui/react';
import React, { useEffect, useState } from 'react';
import { VscClearAll } from 'react-icons/vsc';
import { ModelsCache } from '_view_helpers/constants/engineTypes';
import ReactTooltip from 'react-tooltip';
import { EngineRequestHandler } from '_/renderer/engine-requests/engineRequestHandler';
import { ModelCacheCard } from './ModelCacheCard';
import { LEARN_MORE_MANAGE_MODEL_CACHE } from '../../helpers/constants/documentationConstants';
import { useUser } from 'reactfire';
import { toast } from '../../helpers/functionHelpers';

/**
 * Component that displays and would manage the **Engine**'s model cache.
 */
export const ModelsCacheManager = React.memo(() => {
	const deleteModelsCacheIconColor = mode('thia.gray.700', 'thia.gray.300');
	const deleteModelsCacheIconHoverColor = mode('thia.purple.400', 'thia.purple.300');
	const borderColor = mode('thia.gray.200', 'thia.gray.600');
	const cardBG = mode('thia.gray.100', 'thia.gray.800');
	const spinnerColor = mode('thia.purple.400', 'thia.purple.300');

	const { data: user } = useUser();

	const [modelCacheFetching, setModelCacheFetching] = useState(false);
	const [modelCacheDeleting, setModelCacheDeleting] = useState(false);
	const [modelsCache, setModelsCache] = useState<ModelsCache[]>();

	const fetchModelsCache = async () => {
		setModelCacheFetching(true);
		const [isError, resData] = await EngineRequestHandler.getInstance().getModelsCache();
		if (!isError) {
			setModelsCache(resData);
		}
		setModelCacheFetching(false);
	};

	const deleteEntireModelCache = async () => {
		if (!user) return;
		setModelCacheDeleting(true);
		const [isError, resData] = await EngineRequestHandler.getInstance().deleteEntireModelCache();
		if (!isError) {
			toast({
				title: 'Cache Deleted',
				description: 'Entire model cache was deleted successfully',
				status: 'success',
				duration: 3500,
				isClosable: true,
				uid: user.uid,
			});
		} else {
			toast({
				title: 'Cache Deletion Failed',
				description: resData['Error'],
				status: 'error',
				duration: 3500,
				isClosable: true,
				uid: user.uid,
			});
		}
		setModelCacheDeleting(false);
		await fetchModelsCache();
	};

	const renderIcon = () => {
		if (modelCacheDeleting) {
			return <Spinner size='sm' color={spinnerColor} />;
		} else {
			return (
				<Icon
					data-tip
					data-for='clearAllModelCache'
					cursor='pointer'
					willChange='transform, color'
					transition='all 200ms'
					as={VscClearAll}
					mx='1'
					outline='none'
					color={deleteModelsCacheIconColor}
					_hover={{ color: deleteModelsCacheIconHoverColor, transform: 'scale(1.1)' }}
					onClick={deleteEntireModelCache}
				/>
			);
		}
	};

	const renderModelCacheCards = () => {
		if (modelCacheFetching) {
			return (
				<Center py='2'>
					<Spinner color='thia.gray.400' />
				</Center>
			);
		}
		if (modelsCache && modelsCache.length > 0) {
			return (
				<VStack w='full' px='2' pt='2'>
					{modelsCache?.map((modelCache, index) => (
						<ModelCacheCard
							{...modelCache}
							key={modelCache['modelName']}
							fetchModelsCache={fetchModelsCache}
						/>
					))}
				</VStack>
			);
		} else {
			return (
				<Center w='full' py='2'>
					<Heading as='h5' fontSize='20px'>
						No Models Cached
					</Heading>
				</Center>
			);
		}
	};

	useEffect(() => {
		fetchModelsCache();
	}, []);

	return (
		<Flex
			w='full'
			px='4'
			borderColor={borderColor}
			borderWidth='1px'
			py='2'
			flexDir='column'
			rounded='md'
			bg={cardBG}>
			<HStack w='full' px='1' alignItems='baseline'>
				<Heading as='h5' fontSize='18px'>
					Model Cache
				</Heading>
				<Link fontSize='xs' href={LEARN_MORE_MANAGE_MODEL_CACHE}>
					Learn more
				</Link>
				<Spacer />

				{renderIcon()}
				<ReactTooltip
					id='clearAllModelCache'
					className='tooltip'
					delayShow={300}
					place='left'
					globalEventOff='mouseout'>
					<Box as='span'>Delete Entire Model Cache</Box>
				</ReactTooltip>
			</HStack>
			{renderModelCacheCards()}
		</Flex>
	);
});

ModelsCacheManager.displayName = 'ModelsCacheManager';
