import { Badge, Box, Flex, HStack, Icon, Spacer, Spinner, Text, useColorModeValue as mode } from '@chakra-ui/react';
import React, { useState } from 'react';
import ReactTooltip from 'react-tooltip';
import { ModelsCache } from '../../helpers/constants/engineTypes';
import { RiDeleteBin6Line } from 'react-icons/ri';
import { formatBytesToString } from '../../helpers/textHelper';
import { EngineRequestHandler } from '_/renderer/engine-requests/engineRequestHandler';
import { toast } from '../../helpers/functionHelpers';
import { useUser } from 'reactfire';

interface Props extends ModelsCache {
	fetchModelsCache: () => Promise<void>;
}
export const ModelCacheCard = React.memo(
	({ verboseModelName, modelName, cacheSize, fetchModelsCache, path }: Props) => {
		const borderColor = mode('thia.gray.200', 'thia.gray.600');
		const cacheSizeColor = mode('thia.gray.500', 'thia.gray.400');
		const deleteModelCacheIconColor = mode('thia.gray.700', 'thia.gray.300');
		const deleteModelCacheIconHoverColor = mode('thia.purple.400', 'thia.purple.300');
		const spinnerColor = mode('thia.purple.400', 'thia.purple.300');

		const [modelCacheDeleting, setModelCacheDeleting] = useState(false);
		const { data: user } = useUser();

		const deleteModelCache = async () => {
			if (!user) return;
			setModelCacheDeleting(true);
			const [isError, resData] = await EngineRequestHandler.getInstance().deleteModelCache(verboseModelName);
			if (!isError) {
				toast({
					title: 'Cache Deleted',
					description: `Model ${verboseModelName}'s cache was deleted`,
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
						data-for={`clear${modelName}ModelCache`}
						cursor='pointer'
						willChange='transform, color'
						transition='all 200ms'
						as={RiDeleteBin6Line}
						mx='1'
						outline='none'
						color={deleteModelCacheIconColor}
						_hover={{ color: deleteModelCacheIconHoverColor, transform: 'scale(1.1)' }}
						onClick={deleteModelCache}
					/>
				);
			}
		};

		return (
			<Flex w='full' px='2' borderColor={borderColor} borderWidth='1px' rounded='sm' py='2' alignItems='baseline'>
				<HStack>
					<Badge fontSize='xs' colorScheme='thia.purple'>
						Image Classification
					</Badge>
					<Text>{verboseModelName}</Text>
				</HStack>
				<Spacer />
				<HStack>
					<Text color={cacheSizeColor} fontSize='13px' px='2'>
						{formatBytesToString(cacheSize)}
					</Text>
					{renderIcon()}
					<ReactTooltip
						id={`clear${modelName}ModelCache`}
						className='tooltip'
						delayShow={300}
						place='left'
						globalEventOff='mouseout'>
						<Box as='span'>Delete {verboseModelName} Model's Cache</Box>
					</ReactTooltip>
				</HStack>
			</Flex>
		);
	},
);
