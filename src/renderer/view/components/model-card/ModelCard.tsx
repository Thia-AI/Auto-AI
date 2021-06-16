import React from 'react';
import {
	Box,
	SkeletonCircle,
	SkeletonText,
	Avatar,
	HStack,
	Center,
	Text,
	Badge,
	Spacer,
} from '@chakra-ui/react';

interface Props {
	isLoaded: boolean;
	modelTitle: string;
	modelStatus: string;
	dateLastAccessed: string;
}

export const ModelCard = (props: Props) => {
	return (
		<Box w='80%' pt='2' pb='1' px='4' borderRadius='sm' boxShadow='lg' bg='gray.850'>
			<HStack spacing='4'>
				<SkeletonCircle isLoaded={props.isLoaded} size='10'>
					<Avatar
						size='md'
						title='Ritesh Ahlawat - Creator'
						name='Ritesh Ahlawat'
						src='https://images.unsplash.com/photo-1564564321837-a57b7070ac4f?ixid=MXwxMjA3fDB8MHxzZWFyY2h8MzV8fG1hbiUyMHNpbWxpbmd8ZW58MHx8MHw%3D&ixlib=rb-1.2.1&auto=format&fit=crop&w=100&q=100'
					/>
				</SkeletonCircle>
				<SkeletonText w='full' isLoaded={props.isLoaded} noOfLines={1}>
					<Center pb='4' w='full'>
						{props.modelTitle}
					</Center>
				</SkeletonText>
			</HStack>

			<SkeletonText isLoaded={props.isLoaded} mt='4' noOfLines={3} spacing='4'>
				<HStack>
					<Text alignItems='baseline' fontSize='xs'>
						Status:
					</Text>
					<Badge fontSize='xs' size='xs' ml='1'>
						{props.modelStatus}
					</Badge>
					<Spacer />
					<Text pt='2' color='gray.400' fontSize='xs'>
						{props.dateLastAccessed}
					</Text>
				</HStack>
			</SkeletonText>
		</Box>
	);
};
