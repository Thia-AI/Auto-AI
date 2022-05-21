import React, { useEffect } from 'react';
import {
	Box,
	Center,
	useMediaQuery,
	useColorModeValue as mode,
	HStack,
	Text,
	VStack,
	Heading,
	Spacer,
	Switch,
	useColorMode,
} from '@chakra-ui/react';
import { useVerticalScrollbar } from '_/shared/theming/hooks';

/**
 * Settings page.
 *
 * @react
 */
const Settings = () => {
	const [isLargerThan1280] = useMediaQuery('(min-width: 1280px)');
	const sectionBG = mode('thia.gray.50', 'thia.gray.700');
	const verticalScrollBarSX = useVerticalScrollbar('10px');
	const { colorMode, toggleColorMode } = useColorMode();
	const textColor = mode('thia.gray.700', 'thia.gray.300');

	return (
		<VStack
			px='6'
			w='full'
			spacing='4'
			h='full'
			alignItems='flex-start'
			marginTop='var(--header-height)'
			py='4'
			overflowY='auto'
			sx={verticalScrollBarSX}>
			<VStack
				w={isLargerThan1280 ? '90%' : 'full'}
				py='6'
				alignItems='flex-start'
				willChange='width'
				transition='width 200ms'
				alignSelf='center'
				px='8'
				rounded='lg'
				spacing='6'
				bg={sectionBG}
				shadow='base'>
				<Heading as='h3' size='xl'>
					Settings
				</Heading>

				<HStack w='full'>
					<Box>
						<Heading as='h6' fontSize='18px'>
							Dark Mode
						</Heading>
						<Text color={textColor} fontSize='13px' pt='1'>
							Change the color format of the App to light/dark.
						</Text>
					</Box>
					<Spacer />
					<Switch
						onChange={() => toggleColorMode()}
						size='lg'
						isChecked={colorMode == 'dark'}
						colorScheme='thia.purple'
					/>
				</HStack>
			</VStack>
		</VStack>
	);
};

export default Settings;
