import React from 'react';
import { connect } from 'react-redux';
import { Drawer, DrawerOverlay, DrawerBody, DrawerContent, Box, Flex, Stack, Circle } from '@chakra-ui/react';
import { BiAddToQueue, BiBox, BiCog, BiHome, BiPackage, BiRecycle, BiServer } from 'react-icons/bi';
import { To } from 'history';
import { push, UpdateLocationAction } from '@lagunovsky/redux-react-router';
import { MdHelpOutline, MdHistory, MdNotificationsNone } from 'react-icons/md';
import { FiPercent } from 'react-icons/fi';

import { IAppState } from '_state/reducers';
import { openCloseSideMenu } from '_state/side-menu/SideModelAction';
import { IMenuOpenReducer, ISelectedPageReducer } from '_state/side-menu/model/reducerTypes';
import { IMenuOpenCloseAction } from '_state/side-menu/model/actionTypes';

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
import { useVerticalScrollbar } from '_/renderer/view/helpers/hooks/scrollbar';

interface Props {
	sideMenuOpen: IMenuOpenReducer;
	openCloseSideMenu: () => IMenuOpenCloseAction;
	push: (to: To, state?) => UpdateLocationAction<'push'>;
	selectedPage: ISelectedPageReducer;
}
const SideMenuC = React.memo(({ sideMenuOpen, push, openCloseSideMenu, selectedPage }: Props) => {
	const scrollBarSX = useVerticalScrollbar('6px');
	return (
		<Drawer
			isOpen={sideMenuOpen.value}
			onClose={() => {
				openCloseSideMenu();
			}}
			placement='left'
			size='xs'>
			<DrawerOverlay />
			<DrawerContent zIndex='2'>
				<DrawerBody>
					<Flex h='full' w='full' direction='column' pt='6'>
						<SideMenuProfile />
						<Stack spacing='8' flex='1' overflow='auto' mt='4' pt='4' pr='6' sx={scrollBarSX}>
							<Stack spacing='1'>
								<NavItem
									used
									onClick={() => {
										push('/');
										openCloseSideMenu();
									}}
									active={selectedPage.value == HOME_PAGE}
									icon={<BiHome />}
									label='Home'
								/>
							</Stack>
							<NavGroup label='Your Thia'>
								<NavItem
									used
									onClick={() => {
										push('/models');
										openCloseSideMenu();
									}}
									active={selectedPage.value == MODELS_PAGE}
									icon={<BiAddToQueue />}
									label='Models'
								/>
								<NavItem
									onClick={() => {
										push('/jobs');
										openCloseSideMenu();
									}}
									active={selectedPage.value == JOBS_PAGE}
									icon={<BiBox />}
									label='Jobs'
								/>
								<NavItem
									onClick={() => {
										push('/exports');
										openCloseSideMenu();
									}}
									active={selectedPage.value == EXPORTS_PAGE}
									icon={<BiPackage />}
									label='Exports'
								/>
								<NavItem
									onClick={() => {
										push('/deployments');
										openCloseSideMenu();
									}}
									active={selectedPage.value == DEPLOYMENTS_PAGE}
									icon={<BiServer />}
									label='Deployments'
								/>
								<NavItem
									onClick={() => {
										push('/notifications');
										openCloseSideMenu();
									}}
									active={selectedPage.value == NOTIFICATIONS_PAGE}
									icon={<MdNotificationsNone />}
									label='Notifications'
								/>
								<NavItem
									onClick={() => {
										push('/logs');
										openCloseSideMenu();
									}}
									active={selectedPage.value == LOGS_PAGE}
									icon={<MdHistory />}
									label='Logs'
								/>
							</NavGroup>

							<NavGroup label='Your Account'>
								<NavItem
									onClick={() => {
										push('/quota');
										openCloseSideMenu();
									}}
									active={selectedPage.value == QUOTA_PAGE}
									icon={<FiPercent />}
									label='Quota'
								/>
								<NavItem
									onClick={() => {
										push('/subscription');
										openCloseSideMenu();
									}}
									active={selectedPage.value == SUBSCRIPTION_PAGE}
									icon={<BiRecycle />}
									label='Subsription'
								/>
							</NavGroup>
						</Stack>
						<Box>
							<Stack spacing='1'>
								<NavItem
									used
									onClick={() => {
										push('/settings');
										openCloseSideMenu();
									}}
									active={selectedPage.value == SETTINGS_PAGE}
									icon={<BiCog />}
									label='Settings'
								/>
								<NavItem
									onClick={() => {
										push('/help');
										openCloseSideMenu();
									}}
									active={selectedPage.value == HELP_PAGE}
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

SideMenuC.displayName = 'SideMenu';

const mapStateToProps = (state: IAppState) => ({
	sideMenuOpen: state.sideMenuOpen,
	selectedPage: state.selectedPage,
});

/**
 * Side menu component.
 */
export const SideMenu = connect(mapStateToProps, {
	openCloseSideMenu,
	push,
})(SideMenuC);
