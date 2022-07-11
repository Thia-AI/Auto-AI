import React, { useEffect, useState } from 'react';
import { useColorModeValue as mode, Box, VStack, Heading, Skeleton, HStack, Spinner, Divider } from '@chakra-ui/react';
import { IGetQuickStatsERResponse } from '_/renderer/engine-requests/actions/get/getQuickStats';
import { EngineRequestHandler } from '_/renderer/engine-requests/engineRequestHandler';
import { QuickStat } from '../stats/QuickStat';
import { toast } from '../../helpers/functionHelpers';
import { IEngineStatusReducer } from '_/renderer/state/engine-status/model/reducerTypes';
import { connect } from 'react-redux';
import { IAppState } from '_/renderer/state/reducers';
import { useUser } from 'reactfire';

interface Props {
	engineStarted: IEngineStatusReducer;
}

const QuickStatsC = React.memo(({ engineStarted }: Props) => {
	const [quickStats, setQuickStats] = useState<null | IGetQuickStatsERResponse>(null);
	const [statsLoaded, setStatsLoaded] = useState(false);

	const sectionBG = mode('thia.gray.50', 'thia.gray.700');
	const borderColor = mode('thia.gray.200', 'thia.gray.600');
	const { data: user } = useUser();

	const loadData = async () => {
		if (!user) return;
		setStatsLoaded(false);
		const [quickStatsErr, quickStatsRes] = await EngineRequestHandler.getInstance().getQuickStats();
		if (quickStatsErr) {
			toast({
				title: 'Quick Stats failed to load',
				description: 'Failed to get Quick Stats',
				status: 'error',
				duration: 1500,
				isClosable: true,
				uid: user.uid,
			});
			setStatsLoaded(true);
			return;
		}
		setQuickStats(quickStatsRes);
		setStatsLoaded(true);
	};
	useEffect(() => {
		if (engineStarted.value) {
			loadData();
		}
	}, [engineStarted, user]);

	const renderSpinner = () => {
		if (!statsLoaded) {
			return <Spinner size='sm' />;
		}
	};
	return (
		<Box
			rounded='lg'
			borderWidth='1px'
			borderColor={borderColor}
			bg={sectionBG}
			shadow='base'
			px='3'
			py='1.5'
			w='full'>
			<VStack>
				<HStack pt='1.5'>
					<Heading size='md'>Quick Stats</Heading>
					{renderSpinner()}
				</HStack>
				<Divider />
				<Skeleton w='full' isLoaded={statsLoaded}>
					<QuickStat label='Models' value={quickStats?.num_models} />
					<QuickStat label='Datasets' value={quickStats?.num_datasets} />
					<QuickStat label='Images' value={quickStats?.num_images} />
					<QuickStat label='Labels' value={quickStats?.num_labels} />
					<QuickStat label='Exports' value={quickStats?.num_exports} />
				</Skeleton>
			</VStack>
		</Box>
	);
});

QuickStatsC.displayName = 'QuickStats';

const mapStateToProps = (state: IAppState) => ({
	engineStarted: state.engineStarted,
});

/**
 * Component on the dashboard that displays quick stats.
 */
export const QuickStats = connect(mapStateToProps)(QuickStatsC);
