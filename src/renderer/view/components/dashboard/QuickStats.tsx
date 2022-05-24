import React, { useEffect, useState } from 'react';
import { useColorModeValue as mode, Box, VStack, Heading, Skeleton, HStack, Spinner, Divider } from '@chakra-ui/react';
import { IGetQuickStatsERResponse } from '_/renderer/engine-requests/actions/get/getQuickStats';
import { EngineRequestHandler } from '_/renderer/engine-requests/engineRequestHandler';
import { QuickStat } from '../stats/QuickStat';
import { toast } from '../../helpers/functionHelpers';

/**
 * Component on the dashboard that displays quick stats.
 */
export const QuickStats = React.memo(() => {
	const [quickStats, setQuickStats] = useState<null | IGetQuickStatsERResponse>(null);
	const [statsLoaded, setStatsLoaded] = useState(false);

	const sectionBG = mode('thia.gray.50', 'thia.gray.700');
	const borderColor = mode('thia.gray.200', 'thia.gray.600');

	useEffect(() => {
		const loadData = async () => {
			const [quickStatsErr, quickStatsRes] = await EngineRequestHandler.getInstance().getQuickStats();
			if (quickStatsErr) {
				toast({
					title: 'Error',
					description: 'Failed to get Quick Stats',
					status: 'error',
					duration: 1500,
					isClosable: true,
				});
				setStatsLoaded(true);
				return;
			}
			setQuickStats(quickStatsRes);
			setStatsLoaded(true);
		};

		loadData();
	}, []);

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

QuickStats.displayName = 'QuickStats';
