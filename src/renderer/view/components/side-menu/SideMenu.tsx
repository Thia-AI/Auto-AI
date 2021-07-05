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
import { push, Push } from 'connected-react-router';

import { MdHelpOutline, MdHistory, MdNotificationsNone } from 'react-icons/md';
import { FiPercent } from 'react-icons/fi';

import { IAppState } from '_state/reducers';
import { openCloseSideMenu } from '_state/side-menu/SideModelAction';
import { IMenuOpenReducer, ISelectedPageReducer } from '_state/side-menu/model/reducerTypes';
import { IMenuOpenCloseAction } from '_state/side-menu/model/actionTypes';
import { changeSelectedPage } from '_state/side-menu/SideModelAction';
import { IChangeSelectedPageAction } from '_/renderer/state/side-menu/model/actionTypes';

import { SideMenuProfile } from './profile/SideMenuProfile';
import { NavItem } from './NavItem';
import { NavGroup } from './NavGroup';
import {
	HOME_PAGE,
	MODELS_PAGE,
	JOBS_PAGE,
	EXPORTS_PAGE,
	DEPLOYMENTS_PAGE,
	NOTIFICATIONS_PAGE,
	LOGS_PAGE,
	QUOTA_PAGE,
	SUBSCRIPTION_PAGE,
	SETTINGS_PAGE,
	HELP_PAGE,
} from '_/renderer/view/helpers/constants/pageConstants';

interface Props {
	sideMenuOpen: IMenuOpenReducer;
	openCloseSideMenu: () => IMenuOpenCloseAction;
	push: Push;
	changeSelectedPage: (pageNumber: number) => IChangeSelectedPageAction;
	selectedPage: ISelectedPageReducer;
}
const SideMenuC = React.memo((props: Props) => {
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
									w: '8px',
									bg: 'gray.600',
								},
								'&::-webkit-scrollbar-thumb': {
									bg: 'gray.800',
								},
								'&::-webkit-scrollbar-thumb:hover': {
									bg: 'gray.850',
								},
							}}>
							<Stack spacing='1'>
								<NavItem
									onClick={() => {
										props.changeSelectedPage(HOME_PAGE);
										props.push('/');
										props.openCloseSideMenu();
									}}
									active={props.selectedPage.value == HOME_PAGE}
									icon={<BiHome />}
									label='Home'
								/>
							</Stack>
							<NavGroup label='Your Thia'>
								<NavItem
									onClick={() => {
										props.changeSelectedPage(MODELS_PAGE);
										props.push('/models');
										props.openCloseSideMenu();
									}}
									active={props.selectedPage.value == MODELS_PAGE}
									icon={<BiAddToQueue />}
									label='Models'
								/>
								<NavItem
									onClick={() => {
										props.changeSelectedPage(JOBS_PAGE);
										props.push('/jobs');
										props.openCloseSideMenu();
									}}
									active={props.selectedPage.value == JOBS_PAGE}
									icon={<BiBox />}
									label='Jobs'
								/>
								<NavItem
									onClick={() => {
										props.changeSelectedPage(EXPORTS_PAGE);
										props.push('/exports');
										props.openCloseSideMenu();
									}}
									active={props.selectedPage.value == EXPORTS_PAGE}
									icon={<BiPackage />}
									label='Exports'
								/>
								<NavItem
									onClick={() => {
										props.changeSelectedPage(DEPLOYMENTS_PAGE);
										props.push('/deployments');
										props.openCloseSideMenu();
									}}
									active={props.selectedPage.value == DEPLOYMENTS_PAGE}
									icon={<BiServer />}
									label='Deployments'
								/>
								<NavItem
									onClick={() => {
										props.changeSelectedPage(NOTIFICATIONS_PAGE);
										props.push('/notifications');
										props.openCloseSideMenu();
									}}
									active={props.selectedPage.value == NOTIFICATIONS_PAGE}
									icon={<MdNotificationsNone />}
									label='Notifications'
								/>
								<NavItem
									onClick={() => {
										props.changeSelectedPage(LOGS_PAGE);
										props.push('/logs');
										props.openCloseSideMenu();
									}}
									active={props.selectedPage.value == LOGS_PAGE}
									icon={<MdHistory />}
									label='Logs'
								/>
							</NavGroup>

							<NavGroup label='Your Account'>
								<NavItem
									onClick={() => {
										props.changeSelectedPage(QUOTA_PAGE);
										props.push('/quota');
										props.openCloseSideMenu();
									}}
									active={props.selectedPage.value == QUOTA_PAGE}
									icon={<FiPercent />}
									label='Quota'
								/>
								<NavItem
									onClick={() => {
										props.changeSelectedPage(SUBSCRIPTION_PAGE);
										props.push('/subscription');
										props.openCloseSideMenu();
									}}
									active={props.selectedPage.value == SUBSCRIPTION_PAGE}
									icon={<BiRecycle />}
									label='Subsription'
								/>
							</NavGroup>
						</Stack>
						<Box>
							<Stack spacing='1'>
								<NavItem
									onClick={() => {
										props.changeSelectedPage(SETTINGS_PAGE);
										props.push('/settings');
										props.openCloseSideMenu();
									}}
									subtle
									active={props.selectedPage.value == SETTINGS_PAGE}
									icon={<BiCog />}
									label='Settings'
								/>
								<NavItem
									onClick={() => {
										props.changeSelectedPage(HELP_PAGE);
										props.push('/help');
										props.openCloseSideMenu();
									}}
									subtle
									active={props.selectedPage.value == HELP_PAGE}
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
});

const mapStateToProps = (state: IAppState) => ({
	sideMenuOpen: state.sideMenuOpen,
	selectedPage: state.selectedPage,
});

export const SideMenu = connect(mapStateToProps, {
	openCloseSideMenu,
	push,
	changeSelectedPage,
})(SideMenuC);
