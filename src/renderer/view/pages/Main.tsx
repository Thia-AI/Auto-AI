import React, { useEffect } from 'react';
import { Box, HStack, VStack } from '@chakra-ui/react';

import { NewModelButton } from '_/renderer/view/components/new-model/NewModelButton';
import { ModelSelection } from '_/renderer/view/components/model-selection/ModelSelection';
import { connect } from 'react-redux';
import { changeSelectedPageAction } from '_/renderer/state/side-menu/SideModelAction';
import { IChangeSelectedPageAction } from '_/renderer/state/side-menu/model/actionTypes';
import { HOME_PAGE } from '../helpers/constants/pageConstants';
import { QuickStats } from '../components/dashboard/QuickStats';
import { useVerticalScrollbar } from '_/renderer/view/helpers/hooks/scrollbar';
import { RecentActivities } from '../components/notifications/RecentActivities';

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
			<Box
				w='full'
				h='full'
				marginTop='var(--header-height)'
				py='2.5'
				px='4'
				overflowY='hidden'
				sx={verticalScrollBarSX}>
				<HStack w='full' h='full' justify='space-evenly' pt='2'>
					<Box w='47%' h='full'>
						<RecentActivities />
					</Box>
					<VStack w='47%' justify='space-evenly' h='full'>
						<QuickStats />
						<NewModelButton />
					</VStack>
				</HStack>
			</Box>
		</>
	);
});

Main.displayName = 'Main';

export default connect(null, {
	changeSelectedPage: changeSelectedPageAction,
})(Main);
