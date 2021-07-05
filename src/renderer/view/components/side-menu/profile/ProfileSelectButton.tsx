import { Box, Flex, HStack, Image, useMenuButton, FlexProps } from '@chakra-ui/react';
import React from 'react';
import { HiSelector } from 'react-icons/hi';

export const ProfileSelectButton = React.memo((props: FlexProps) => {
	const buttonProps = useMenuButton(props);
	return (
		<Flex
			as='button'
			{...buttonProps}
			w='full'
			display='flex'
			alignItems='center'
			rounded='lg'
			bg='gray.700'
			px='3'
			pt='2'
			pb='4'
			fontSize='sm'
			userSelect='none'
			cursor='pointer'
			outline='0'
			transition='all 0.2s'
			_active={{ bg: 'gray.600' }}>
			<HStack flex='1' spacing='3'>
				<Image
					w='8'
					h='8'
					rounded='md'
					objectFit='cover'
					alt='Chakra UI'
					src='https://images.unsplash.com/photo-1564564321837-a57b7070ac4f?ixid=MXwxMjA3fDB8MHxzZWFyY2h8MzV8fG1hbiUyMHNpbWxpbmd8ZW58MHx8MHw%3D&ixlib=rb-1.2.1&auto=format&fit=crop&w=100&q=100'
				/>
				<Box textAlign='start'>
					<Box isTruncated fontWeight='semibold'>
						Ritesh
					</Box>
					<Box isTruncated fontSize='xs' color='gray.400'>
						ID 233223
					</Box>
				</Box>
			</HStack>
			<Box fontSize='lg' color='gray.400'>
				<HiSelector />
			</Box>
		</Flex>
	);
});
