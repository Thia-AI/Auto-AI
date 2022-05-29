import { Box, Flex, Heading, HStack, Image, useColorModeValue, useMenuButton } from '@chakra-ui/react';
import React from 'react';
import { HiSelector } from 'react-icons/hi';

type Props = {
	displayName: string;
	imageURL?: string;
};
/**
 * Side menu profile button.
 */
export const ProfileSelectButton = React.memo(({ displayName, imageURL }: Props) => {
	const buttonProps = useMenuButton();
	const profileBG = useColorModeValue('thia.gray.50', 'thia.gray.750');
	const profileBGHover = useColorModeValue('thia.gray.100', 'thia.gray.700');
	const profileBGClicking = useColorModeValue('thia.gray.50', 'thia.gray.600');
	const boxShadow = useColorModeValue('lg', 'sm');
	const color = useColorModeValue('thia.gray.700', 'thia.gray.400');

	return (
		<Flex
			as='button'
			{...buttonProps}
			w='full'
			display='flex'
			alignItems='center'
			rounded='lg'
			bg={profileBG}
			px='3'
			pt='2'
			pb='4'
			fontSize='sm'
			userSelect='none'
			boxShadow={boxShadow}
			cursor='pointer'
			outline='0'
			transition='all 0.2s'
			_hover={{ bg: profileBGHover }}
			_active={{ bg: profileBGClicking }}>
			<HStack flex='1' spacing='3'>
				<Image
					w='8'
					h='8'
					rounded='md'
					objectFit='cover'
					alt='Profile picture'
					title={displayName}
					src={imageURL}
				/>
				<Box textAlign='start' maxW='180px'>
					<Heading fontWeight='semibold' fontSize='sm' isTruncated>
						{displayName}
					</Heading>
				</Box>
			</HStack>
			<Box fontSize='lg' color={color}>
				<HiSelector />
			</Box>
		</Flex>
	);
});

ProfileSelectButton.displayName = 'ProfileSelectButton';
