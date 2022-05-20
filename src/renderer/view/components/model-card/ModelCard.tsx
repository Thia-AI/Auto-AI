import React from 'react';
import {
	SkeletonCircle,
	SkeletonText,
	Avatar,
	HStack,
	Center,
	Text,
	Badge,
	Spacer,
	VStack,
	Divider,
	Skeleton,
	ThemingProps,
	useColorModeValue,
} from '@chakra-ui/react';

import { getVerboseModelType } from '_view_helpers/modelHelper';

import Preview from '_utils/images/placeholder-dark.jpg';
import './ModelCard.css';
import { InteractiveCopyBadge } from '../interactive/InteractiveCopyBadge';
import { Model, ModelStatus } from '../../helpers/constants/engineDBTypes';

interface Props {
	isLoaded: boolean;
	model: Model;
	onClick: () => void;
}

/**
 * Card representing a model in the
 */
export const ModelCard = React.memo(({ model, onClick, isLoaded }: Props) => {
	const modelCardBG = useColorModeValue('thia.gray.700', 'thia.gray.700');
	const statusColor = (): ThemingProps['colorScheme'] => {
		switch (model.model_status) {
			case ModelStatus.IDLE:
				return 'thia.gray';
			case ModelStatus.TRAINED:
				return 'thia.purple';
			case ModelStatus.TRAINING:
			case ModelStatus.STARTING_TRAINING:
				return 'green';
			case ModelStatus.ERROR:
				return 'red';
			default:
				return 'gray';
		}
	};

	return (
		<HStack
			willChange='transform'
			cursor='pointer'
			onClick={onClick}
			_hover={{
				transform: `${isLoaded ? 'scale(1.01)' : ''}`,
			}}
			transition={isLoaded ? 'all 250ms' : ''}
			w='80%'
			h='125px'
			pt='2'
			pb='1'
			px='4'
			borderRadius='lg'
			boxShadow='lg'
			bg={modelCardBG}>
			<VStack spacing='2' alignItems='flex-start'>
				<SkeletonCircle isLoaded={isLoaded} size='10'>
					<Avatar
						size='md'
						title='Ritesh Ahlawat - Creator'
						name='Ritesh Ahlawat'
						src='https://images.unsplash.com/photo-1564564321837-a57b7070ac4f?ixid=MXwxMjA3fDB8MHxzZWFyY2h8MzV8fG1hbiUyMHNpbWxpbmd8ZW58MHx8MHw%3D&ixlib=rb-1.2.1&auto=format&fit=crop&w=100&q=100'
					/>
				</SkeletonCircle>
				<Spacer />
				<SkeletonText w='90px' isLoaded={isLoaded} noOfLines={2}>
					<HStack maxW='full' spacing='0.5'>
						<Text alignItems='baseline' fontSize='0.6rem'>
							Status:
						</Text>
						<Badge colorScheme={statusColor()} fontSize='0.6rem' maxW='60%'>
							<Text isTruncated>{model.model_status}</Text>
						</Badge>
					</HStack>
					<InteractiveCopyBadge badgeID={model.id} />
				</SkeletonText>
			</VStack>
			<Divider orientation='vertical' />
			<Skeleton w='full' h='full' isLoaded={isLoaded}>
				<VStack bgImage={Preview} bgPos='center' bgSize='cover' borderRadius='lg' h='full'>
					<Center pb='4' w='full'>
						<Text color='gray.100' fontWeight='semibold' letterSpacing='0.15rem'>
							{model.model_name}:
						</Text>
						<Badge ml='2' colorScheme='purple'>
							{getVerboseModelType(model.model_type)}
						</Badge>
					</Center>
					<Spacer />
					<HStack px='2' h='full' w='full' justifyContent='flex-end' alignItems='flex-end'>
						<Text mb='1' color='gray.400' fontSize='xs'>
							{new Date(model.date_created).toDateString()}
						</Text>
					</HStack>
				</VStack>
			</Skeleton>
		</HStack>
	);
});

ModelCard.displayName = 'ModelCard';
