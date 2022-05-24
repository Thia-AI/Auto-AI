import React, { useEffect } from 'react';
import { Box, HStack, Spacer, VStack } from '@chakra-ui/react';

import { NewModelButton } from '_/renderer/view/components/new-model/NewModelButton';
import { ModelSelection } from '_/renderer/view/components/model-selection/ModelSelection';
import { connect } from 'react-redux';
import { changeSelectedPageAction } from '_/renderer/state/side-menu/SideModelAction';
import { IChangeSelectedPageAction } from '_/renderer/state/side-menu/model/actionTypes';
import { HOME_PAGE } from '../helpers/constants/pageConstants';
import { QuickStats } from '../components/dashboard/QuickStats';
import { useVerticalScrollbar } from '_/renderer/view/helpers/hooks/scrollbar';
import { RecentNotifications } from '../components/notifications/RecentNotifications';

interface Props {
	changeSelectedPage: (pageNumber: number) => IChangeSelectedPageAction;
}

/**
 * Component for main portion of **renderer**.
 *
 * @react
 */
const Main = React.memo(({ changeSelectedPage }: Props) => {
	const verticalScrollBarSX = useVerticalScrollbar('10px');
	useEffect(() => {
		changeSelectedPage(HOME_PAGE);
	}, []);

	return (
		<>
			<ModelSelection />
			<VStack
				w='full'
				h='full'
				overflowY='auto'
				marginTop='var(--header-height)'
				py='2.5'
				px='4'
				sx={verticalScrollBarSX}>
				<HStack w='full' h='full' justify='space-evenly' pt='2'>
					<Box w='47%' h='full'>
						<RecentNotifications />
					</Box>
					<VStack w='47%' justify='space-evenly' h='full'>
						<QuickStats />
						<Box w='full' bg='blue.300' h='full' />
					</VStack>
				</HStack>
				<Spacer />
				<NewModelButton />
			</VStack>
		</>
	);
});

Main.displayName = 'Main';

export default connect(null, {
	changeSelectedPage: changeSelectedPageAction,
})(Main);
