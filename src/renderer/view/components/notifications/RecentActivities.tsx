import {
	Accordion,
	Box,
	Center,
	Divider,
	Heading,
	HStack,
	Icon,
	Skeleton,
	Spacer,
	Spinner,
	useBreakpointValue,
	useColorModeValue as mode,
	VStack,
} from '@chakra-ui/react';
import React, { useEffect, useState } from 'react';
import { VscClearAll } from 'react-icons/vsc';
import ReactTooltip from 'react-tooltip';
import { ElectronStoreActivity, isElectronStoreActivityArrayTypeGuard } from '_/main/store/activityStoreManager';
import { useVerticalScrollbar } from '../../helpers/hooks/scrollbar';
import { deleteAllActivities, getAllActivities } from '../../helpers/ipcHelpers';
import { RecentActivity } from './RecentActivity';

/**
 * Component that renders the recent notificatiopns on the dashboard.
 */
export const RecentActivities = React.memo(() => {
	const [activities, setActivities] = useState<ElectronStoreActivity[]>([]);
	const [activitiesLoaded, setActivitiesLoaded] = useState(false);
	const sectionBG = mode('thia.gray.50', 'thia.gray.700');
	const borderColor = mode('thia.gray.200', 'thia.gray.600');
	const clearActivitiesColor = mode('thia.gray.700', 'thia.gray.300');
	const clearActivitiesHoverColor = mode('thia.purple.400', 'thia.purple.300');
	const scrollBarSX = useVerticalScrollbar('6px');
	const noActivitiesHeadingSize = useBreakpointValue({ base: '6xl', lg: '7xl', xl: '8xl', '2xl': '9xl' });

	const fetchActivities = async () => {
		setActivitiesLoaded(false);
		const activities = await getAllActivities('arraySortedByDate');
		if (isElectronStoreActivityArrayTypeGuard(activities)) {
			setActivities(activities);
		}
		setActivitiesLoaded(true);
	};
	useEffect(() => {
		fetchActivities();
	}, []);

	useEffect(() => {
		if (activitiesLoaded) {
			console.log(activities);
		}
	}, [activities, activitiesLoaded]);

	const clearAllActivities = async () => {
		await deleteAllActivities();
		await fetchActivities();
	};

	const renderActivities = () => {
		if (activities.length == 0) {
			return (
				<Center w='full' h='full'>
					<Heading fontSize={noActivitiesHeadingSize} textAlign='center' lineHeight='tall'>
						No Recent Activity
					</Heading>
				</Center>
			);
		}
		return (
			<Skeleton
				w='full'
				h='full'
				pr='2'
				isLoaded={activitiesLoaded}
				overflowY='auto'
				sx={scrollBarSX}
				maxH='full'>
				<Accordion allowMultiple allowToggle>
					{activities.map((activity) => {
						return (
							<RecentActivity
								key={activity.id}
								activity={activity}
								refreshActivitiesList={fetchActivities}
							/>
						);
					})}
				</Accordion>
			</Skeleton>
		);
	};
	const renderSpinner = () => {
		if (!activitiesLoaded) {
			return <Spinner size='sm' />;
		} else {
			return (
				<>
					<Icon
						data-tip
						data-for='clearAllActivities'
						cursor='pointer'
						willChange='transform, color'
						transition='all 200ms'
						as={VscClearAll}
						mx='1'
						outline='none'
						color={clearActivitiesColor}
						onClick={clearAllActivities}
						_hover={{ color: clearActivitiesHoverColor, transform: 'scale(1.1)' }}
					/>
					<ReactTooltip
						id='clearAllActivities'
						className='tooltip'
						delayShow={300}
						place='bottom'
						globalEventOff='mouseout'>
						<Box as='span'>Clear Recent Activity</Box>
					</ReactTooltip>
				</>
			);
		}
	};

	return (
		<Box
			w='full'
			h='full'
			rounded='lg'
			borderWidth='1px'
			borderColor={borderColor}
			bg={sectionBG}
			shadow='base'
			px='3'
			py='1.5'>
			<VStack maxH='full' w='full' h='full'>
				<HStack w='full' pt='1.5'>
					<Heading size='md' textAlign='center' pl='1'>
						Recent Activity
					</Heading>
					<Spacer />
					{renderSpinner()}
				</HStack>
				<Divider />
				{renderActivities()}
			</VStack>
		</Box>
	);
});

RecentActivities.displayName = 'RecentActivities';
