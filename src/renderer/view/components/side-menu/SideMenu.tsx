import React from 'react';
import { connect } from 'react-redux';
import {
	Drawer,
	DrawerOverlay,
	DrawerBody,
	DrawerContent,
	Box,
	Flex,
	Stack,
	Circle,
} from '@chakra-ui/react';
import { BiAddToQueue, BiBox, BiCog, BiHome, BiPackage, BiRecycle, BiServer } from 'react-icons/bi';

import { MdHelpOutline, MdHistory, MdNotificationsNone } from 'react-icons/md';
import { FiPercent } from 'react-icons/fi';

import { IAppState } from '_state/reducers';
import { openCloseSideMenu } from '_state/side-menu/SideModelAction';
import { IMenuOpenReducer } from '_state/side-menu/model/reducerTypes';
import { IMenuOpenCloseAction } from '_state/side-menu/model/actionTypes';

import { SideMenuProfile } from './profile/SideMenuProfile';
import { NavItem } from './NavItem';
import { NavGroup } from './NavGroup';

interface Props {
	sideMenuOpen: IMenuOpenReducer;
	openCloseSideMenu: () => IMenuOpenCloseAction;
}
const SideMenuC = (props: Props) => {
	return (
		<Drawer
			isOpen={props.sideMenuOpen.value}
			onClose={() => {
				props.openCloseSideMenu();
			}}
			placement='left'
			size='xs'>
			<DrawerOverlay />
			<DrawerContent zIndex='2'>
				<DrawerBody bg='gray.900'>
					<Flex h='full' w='full' direction='column' pt='6'>
						<SideMenuProfile />
						<Stack
							spacing='8'
							flex='1'
							overflow='auto'
							mt='4'
							pt='4'
							pr='6'
							sx={{
								'&::-webkit-scrollbar': {
									width: '10px',
									backgroundColor: 'gray.600',
								},
								'&::-webkit-scrollbar-thumb': {
									backgroundColor: 'gray.800',
								},
								'&::-webkit-scrollbar-thumb:hover': {
									backgroundColor: 'gray.850',
								},
							}}>
							<Stack spacing='1'>
								<NavItem
									onClick={props.openCloseSideMenu}
									active
									icon={<BiHome />}
									label='Home'
								/>
							</Stack>
							<NavGroup label='Your Thia'>
								<NavItem
									onClick={props.openCloseSideMenu}
									icon={<BiAddToQueue />}
									label='Models'
								/>
								<NavItem
									onClick={props.openCloseSideMenu}
									icon={<BiBox />}
									label='Jobs'
								/>
								<NavItem
									onClick={props.openCloseSideMenu}
									icon={<BiPackage />}
									label='Exports'
								/>
								<NavItem
									onClick={props.openCloseSideMenu}
									icon={<BiServer />}
									label='Deployments'
								/>
								<NavItem
									onClick={props.openCloseSideMenu}
									icon={<MdNotificationsNone />}
									label='Notifications'
								/>
								<NavItem
									onClick={props.openCloseSideMenu}
									icon={<MdHistory />}
									label='Logs'
								/>
							</NavGroup>

							<NavGroup label='Your Account'>
								<NavItem
									onClick={props.openCloseSideMenu}
									icon={<FiPercent />}
									label='Quota'
								/>
								<NavItem
									onClick={props.openCloseSideMenu}
									icon={<BiRecycle />}
									label='Subsription'
								/>
							</NavGroup>
						</Stack>
						<Box>
							<Stack spacing='1'>
								<NavItem
									onClick={props.openCloseSideMenu}
									subtle
									icon={<BiCog />}
									label='Settings'
								/>
								<NavItem
									onClick={props.openCloseSideMenu}
									subtle
									icon={<MdHelpOutline />}
									label='Help & Support'
									endElement={<Circle size='2' bg='blue.400' />}
								/>
							</Stack>
						</Box>
					</Flex>
				</DrawerBody>
			</DrawerContent>
		</Drawer>
	);
};

const mapStateToProps = (state: IAppState) => ({
	sideMenuOpen: state.sideMenuOpen,
});

export const SideMenu = connect(mapStateToProps, {
	openCloseSideMenu,
})(SideMenuC);
