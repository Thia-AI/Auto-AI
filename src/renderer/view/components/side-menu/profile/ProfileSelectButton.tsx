import { Box, Flex, HStack, Image, useColorModeValue, useMenuButton } from '@chakra-ui/react';
import React from 'react';
import { HiSelector } from 'react-icons/hi';

type Props = {
	displayName?: string | null;
	imageURL?: string;
};
/**
 * Side menu profile button.
 */
export const ProfileSelectButton = React.memo(({ displayName, imageURL }: Props) => {
	const buttonProps = useMenuButton();
	const profileBG = useColorModeValue('thia.gray.400', 'thia.gray.700');
	const profileBGActive = useColorModeValue('thia.gray.300', 'thia.gray.600');
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
			cursor='pointer'
			outline='0'
			transition='all 0.2s'
			_active={{ bg: profileBGActive }}>
			<HStack flex='1' spacing='3'>
				<Image w='8' h='8' rounded='md' objectFit='cover' alt='Chakra UI' src={imageURL} />
				<Box textAlign='start'>
					<Box isTruncated fontWeight='semibold'>
						{displayName}
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

ProfileSelectButton.displayName = 'ProfileSelectButton';
