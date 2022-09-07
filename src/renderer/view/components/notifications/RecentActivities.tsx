import {
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
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { VariableSizeList as List } from 'react-window';
import { VscClearAll } from 'react-icons/vsc';
import ReactTooltip from 'react-tooltip';
import { useUser } from 'reactfire';
import AutoSizer from '../autosizer/AutoSizer.jsx';
import { ElectronStoreActivity, isElectronStoreActivityArrayTypeGuard } from '_/main/store/activityStoreManager';
import { deleteAllActivities, getAllActivities } from '../../helpers/ipcHelpers';
import { RecentActivity } from './RecentActivity';
import './RecentActivities.css';

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
	const listClass = mode('list-light', 'list-dark');
	const noActivitiesHeadingSize = useBreakpointValue({ base: '6xl', lg: '7xl', xl: '8xl', '2xl': '9xl' });

	const listRef = useRef<List>(null);
	const listInnerRef = useRef<HTMLDivElement>(null);

	interface SizeMap {
		[key: number]: number;
	}

	const sizeMap = useRef<SizeMap>({});

	const setSize = useCallback((index: number, size) => {
		if (listRef.current) {
			sizeMap.current = { ...sizeMap.current, [index]: size };
			listRef.current.resetAfterIndex(index);
		}
	}, []);

	const getSize = (index: number) => sizeMap.current[index] || 60;

	const { data: user } = useUser();

	const fetchActivities = async () => {
		if (!user) return;
		setActivitiesLoaded(false);
		const activities = await getAllActivities('arraySortedByDate', user.uid);
		if (isElectronStoreActivityArrayTypeGuard(activities)) {
			setActivities(activities);
		}
		setActivitiesLoaded(true);
	};
	useEffect(() => {
		fetchActivities();
	}, [user]);

	const clearAllActivities = async () => {
		if (!user) return;
		await deleteAllActivities(user.uid);
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
			<Skeleton w='full' h='full' pr='2' isLoaded={activitiesLoaded} overflowY='auto' maxH='full'>
				<AutoSizer>
					{({ height, width }) => (
						<List
							height={height}
							itemCount={activities.length}
							itemSize={getSize}
							innerRef={listInnerRef}
							width={width}
							itemData={{
								activities,
								refreshActivitiesList: fetchActivities,
								setSize,
							}}
							ref={listRef}
							className={listClass}>
							{RecentActivity}
						</List>
					)}
				</AutoSizer>
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
