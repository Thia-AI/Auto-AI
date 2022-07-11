import {
	AccordionButton,
	AccordionIcon,
	AccordionItem,
	AccordionPanel,
	Box,
	Spacer,
	BackgroundProps,
	Text,
	useColorModeValue as mode,
	Icon,
	useBreakpointValue,
} from '@chakra-ui/react';
import React from 'react';
import { AiOutlineClear } from 'react-icons/ai';
import ReactTooltip from 'react-tooltip';
import { useUser } from 'reactfire';
import { ElectronStoreActivity } from '_/main/store/activityStoreManager';
import { deleteActivity } from '../../helpers/ipcHelpers';
import { capitalizeFirstLetter } from '../../helpers/textHelper';

interface Props {
	activity: ElectronStoreActivity;
	refreshActivitiesList: () => Promise<void>;
}

/**
 * Component that renders a single recent notification.
 */
export const RecentActivity = React.memo(({ activity, refreshActivitiesList }: Props) => {
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

	const activityTitleMaxWidth = useBreakpointValue({ base: '80%', lg: '85%', xl: '88%', '2xl': '90%' });

	const { data: user } = useUser();

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
		<AccordionItem
			w='full'
			mt='2'
			shadow={shadow}
			border='none'
			borderWidth='1px'
			borderStyle='solid'
			borderColor={borderColor}
			borderRadius='md'>
			<AccordionButton>
				<Box
					w='11px'
					h='11px'
					borderRadius='50%'
					bg={indicatorColor()}
					mr='1'
					title={capitalizeFirstLetter(activity.status ?? '')}
				/>
				<Box flex='1' textAlign='left' maxW={activityTitleMaxWidth}>
					<Text fontSize='sm' fontWeight='700' noOfLines={1}>
						{activity.title}
					</Text>
				</Box>
				<Spacer />
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
					place='bottom'
					globalEventOff='mouseout'>
					<Box as='span'>Clear Activity</Box>
				</ReactTooltip>
				<AccordionIcon />
			</AccordionButton>
			<AccordionPanel py='2'>
				<Text fontSize='xs' userSelect='text' color={descriptionColor}>
					{activity.description}
				</Text>
			</AccordionPanel>
		</AccordionItem>
	);
});

RecentActivity.displayName = 'RecentActivity';
