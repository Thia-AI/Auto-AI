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
	Box,
} from '@chakra-ui/react';

import {
	ERROR,
	GENERATIVE,
	IDLE,
	IMAGE_CLASSIFICATION,
	OBJECT_DETECTION,
	OBJECT_TRACKING,
	TRAINING,
} from '_view_helpers/modelConstants';

import Preview from '_utils/images/placeholder-nn-blurred.jpg';

interface Props {
	isLoaded: boolean;
	modelTitle: string;
	modelStatus: string;
	dateCreated: string;
	modelType: string;
	onClick: () => void;
}

export const ModelCard = React.memo((props: Props) => {
	const modelType = () => {
		switch (props.modelType) {
			case IMAGE_CLASSIFICATION[0]:
				return IMAGE_CLASSIFICATION[1];
			case GENERATIVE[0]:
				return GENERATIVE[1];
			case OBJECT_DETECTION[0]:
				return OBJECT_DETECTION[1];
			case OBJECT_TRACKING[0]:
				return OBJECT_TRACKING[1];
			default:
				return 'Other Model';
		}
	};

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
				transform: `${props.isLoaded ? 'scale(1.03)' : ''}`,
			}}
			transition={props.isLoaded ? 'all 250ms' : ''}
			w='80%'
			h='100px'
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
				<SkeletonText w='80px' isLoaded={props.isLoaded} noOfLines={1}>
					<HStack>
						<Text alignItems='baseline' fontSize='xs'>
							Status:
						</Text>
						<Badge colorScheme={statusColor()} fontSize='xs' size='xs' ml='1'>
							{props.modelStatus}
						</Badge>
					</HStack>
				</SkeletonText>
			</VStack>
			<Divider orientation='vertical' />
			<SkeletonText w='full' h='full' isLoaded={props.isLoaded} noOfLines={4} spacing='4'>
				<VStack bgImage={Preview} bgPos='center' bgSize='cover' borderRadius='lg' h='full'>
					<Center pb='4' w='full'>
						<Text color='gray.100' fontWeight='semibold' letterSpacing='0.15rem'>
							{props.modelTitle} -
						</Text>
						<Badge ml='2' colorScheme='purple'>
							{modelType()}
						</Badge>
					</Center>
					<Spacer />
					<HStack px='2' h='full' w='full' justifyContent='flex-end'>
						<Text pt='2' color='gray.400' fontSize='xs'>
							{new Date(props.dateCreated).toDateString()}
						</Text>
					</HStack>
				</VStack>
			</SkeletonText>
		</HStack>
	);
});
