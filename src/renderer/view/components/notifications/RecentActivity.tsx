import { Box, BackgroundProps, Text, useColorModeValue as mode, Icon, HStack, Divider } from '@chakra-ui/react';
import React, { useEffect, useRef } from 'react';
import { AiOutlineClear } from 'react-icons/ai';
import ReactTooltip from 'react-tooltip';
import { useUser } from 'reactfire';
import { areEqual } from 'react-window';
import { ElectronStoreActivity } from '_/main/store/activityStoreManager';
import { deleteActivity } from '../../helpers/ipcHelpers';
import { capitalizeFirstLetter } from '../../helpers/textHelper';

interface ActivityData {
	activities: ElectronStoreActivity[];
	refreshActivitiesList: () => Promise<void>;
	setSize: (index: number, size: number) => void;
}
interface Props {
	data: ActivityData;
	style: React.CSSProperties;
	index: number;
}

/**
 * Component that renders a single recent notification.
 */
export const RecentActivity = React.memo(({ data, index, style }: Props) => {
	const { activities, refreshActivitiesList, setSize } = data;
	const activity = activities[index];
	const borderColor = mode(
		'var(--chakra-colors-thia-gray-200) !important',
		'var(--chakra-colors-thia-gray-600) !important',
	);

	const shadow = mode('sm', 'lg');

	const descriptionColor = mode('thia.gray.500', 'thia.gray.200');
	const infoIndicatorColor = mode('thia.purple.500', 'thia.purple.450');
	const errorIndicatorColor = mode('red.500', 'red.400');
	const warningIndicatorColor = mode('yellow.500', 'yellow.400');
	const defaultIndicatorColor = mode('thia.gray.400', 'thia.gray.500');
	const successIndicatorColor = mode('green.400', 'green.500');

	const clearActivityColor = mode('thia.gray.700', 'thia.gray.300');
	const clearActivityHoverColor = mode('thia.purple.400', 'thia.purple.300');

	const activityRef = useRef<HTMLDivElement | null>(null);

	const { data: user } = useUser();

	useEffect(() => {
		if (activityRef.current) {
			setSize(index, activityRef.current.getBoundingClientRect().height + 4);
		}
	}, [setSize, index, activityRef.current]);

	const indicatorColor = (): BackgroundProps['bg'] => {
		switch (activity.status) {
			case 'error':
				return errorIndicatorColor;
			case 'info':
				return infoIndicatorColor;
			case 'success':
				return successIndicatorColor;
			case 'warning':
				return warningIndicatorColor;
			default:
				return defaultIndicatorColor;
		}
	};

	const clearActivity = async (e: React.MouseEvent<SVGElement, MouseEvent>) => {
		if (!user) return;
		// Stop event from bubbling (stops accordion from opening)
		e.stopPropagation();
		await deleteActivity(activity.id, user.uid);
		await refreshActivitiesList();
	};

	return (
		<Box w='full' px='1' py='0.5' style={style} ref={activityRef}>
			<Box
				w='full'
				px='2'
				pt='1'
				shadow={shadow}
				border='none'
				borderWidth='1px'
				borderStyle='solid'
				borderColor={borderColor}
				borderRadius='md'>
				<HStack w='full'>
					<Box
						w='11px'
						h='11px'
						borderRadius='50%'
						bg={indicatorColor()}
						mr='1'
						title={capitalizeFirstLetter(activity.status ?? '')}
					/>
					<Box flex='1' textAlign='left' maxW='full'>
						<Text fontSize='sm' title={activity.title} fontWeight='700' noOfLines={1}>
							{activity.title}
						</Text>
					</Box>
					<Icon
						data-tip
						data-for='clearActivity'
						cursor='pointer'
						willChange='transform, color'
						transition='all 200ms'
						as={AiOutlineClear}
						mx='1'
						outline='none'
						color={clearActivityColor}
						onClick={clearActivity}
						_hover={{ color: clearActivityHoverColor, transform: 'scale(1.1)' }}
					/>
					<ReactTooltip
						id='clearActivity'
						className='tooltip'
						delayShow={300}
						place='left'
						globalEventOff='mouseout'>
						<Box as='span'>Clear Activity</Box>
					</ReactTooltip>
				</HStack>
				<Divider mt='1' />
				<Box py='1'>
					<Text fontSize='xs' userSelect='text' color={descriptionColor}>
						{typeof activity.description === 'string' ? activity.description : 'Unknown error'}
					</Text>
				</Box>
			</Box>
		</Box>
	);
}, areEqual);

RecentActivity.displayName = 'RecentActivity';
