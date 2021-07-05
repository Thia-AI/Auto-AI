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
} from '@chakra-ui/react';

import { ERROR, IDLE, TRAINING } from '_view_helpers/constants/modelConstants';

import { getVerboseModelType } from '_view_helpers/modelHelper';

import Preview from '_utils/images/placeholder-dark.jpg';
import './ModelCard.css';
import { InteractiveCopyBadge } from '../interactive/InteractiveCopyBadge';

interface Props {
	isLoaded: boolean;
	modelTitle: string;
	modelStatus: string;
	dateCreated: string;
	modelType: string;
	modelID: string;
	onClick: () => void;
}

export const ModelCard = React.memo((props: Props) => {
	const statusColor = () => {
		switch (props.modelStatus.toLowerCase()) {
			case IDLE:
				return 'gray';
			case TRAINING:
				return 'green';
			case ERROR:
				return 'red';
		}
	};
	return (
		<HStack
			willChange='transform'
			cursor='pointer'
			onClick={props.onClick}
			_hover={{
				transform: `${props.isLoaded ? 'scale(1.01)' : ''}`,
			}}
			transition={props.isLoaded ? 'all 250ms' : ''}
			w='80%'
			h='125px'
			pt='2'
			pb='1'
			px='4'
			borderRadius='lg'
			boxShadow='lg'
			bg='gray.850'>
			<VStack spacing='2' alignItems='flex-start'>
				<SkeletonCircle isLoaded={props.isLoaded} size='10'>
					<Avatar
						size='md'
						title='Ritesh Ahlawat - Creator'
						name='Ritesh Ahlawat'
						src='https://images.unsplash.com/photo-1564564321837-a57b7070ac4f?ixid=MXwxMjA3fDB8MHxzZWFyY2h8MzV8fG1hbiUyMHNpbWxpbmd8ZW58MHx8MHw%3D&ixlib=rb-1.2.1&auto=format&fit=crop&w=100&q=100'
					/>
				</SkeletonCircle>
				<Spacer />
				<SkeletonText w='80px' isLoaded={props.isLoaded} noOfLines={2}>
					<HStack>
						<Text alignItems='baseline' fontSize='xs'>
							Status:
						</Text>
						<Badge colorScheme={statusColor()} fontSize='xs' size='xs' ml='1'>
							{props.modelStatus}
						</Badge>
					</HStack>
					<InteractiveCopyBadge badgeID={props.modelID} />
				</SkeletonText>
			</VStack>
			<Divider orientation='vertical' />
			<Skeleton w='full' h='full' isLoaded={props.isLoaded}>
				<VStack bgImage={Preview} bgPos='center' bgSize='cover' borderRadius='lg' h='full'>
					<Center pb='4' w='full'>
						<Text color='gray.100' fontWeight='semibold' letterSpacing='0.15rem'>
							{props.modelTitle}:
						</Text>
						<Badge ml='2' colorScheme='purple'>
							{getVerboseModelType(props.modelType)}
						</Badge>
					</Center>
					<Spacer />
					<HStack
						px='2'
						h='full'
						w='full'
						justifyContent='flex-end'
						alignItems='flex-end'>
						<Text mb='1' color='gray.400' fontSize='xs'>
							{new Date(props.dateCreated).toDateString()}
						</Text>
					</HStack>
				</VStack>
			</Skeleton>
		</HStack>
	);
});
