import { Menu, MenuList, useColorModeValue, Text, MenuDivider, MenuItem } from '@chakra-ui/react';
import React from 'react';

import { ProfileSelectButton } from './ProfileSelectButton';

export const SideMenuProfile = () => {
	return (
		<Menu>
			<ProfileSelectButton />
			<MenuList shadow='lg' py='4' color={useColorModeValue('gray.600', 'gray.200')} px='3'>
				<Text fontSize='sm' fontWeight='medium' mb='2'>
					joe.biden@chakra-ui.com
				</Text>
				<MenuDivider />
				<MenuItem fontWeight='light' fontSize='sm' rounded='md'>
					Edit Profile
				</MenuItem>
				<MenuItem fontWeight='light' fontSize='sm' rounded='md'>
					Notification Settings
				</MenuItem>
				<MenuDivider />
				<MenuItem
					bg='red.400'
					_active={{ bg: 'red.500' }}
					_focus={{ bg: 'red.450' }}
					rounded='md'>
					Logout
				</MenuItem>
			</MenuList>
		</Menu>
	);
};
