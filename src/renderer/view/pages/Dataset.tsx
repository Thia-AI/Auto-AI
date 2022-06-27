import React, { useEffect } from 'react';

import {
	Box,
	HStack,
	Skeleton,
	VStack,
	Text,
	Badge,
	Spacer,
	useMediaQuery,
	useColorModeValue as mode,
} from '@chakra-ui/react';
import { useParams } from 'react-router-dom';
import { connect } from 'react-redux';

import { EngineRequestHandler } from '_/renderer/engine-requests/engineRequestHandler';
import { Dataset, Labels, nullDataset } from '_/renderer/view/helpers/constants/engineTypes';
import { getVerboseModelType } from '../helpers/modelHelper';
import { InteractiveCopyBadge } from '../components/interactive/InteractiveCopyBadge';
import { DragNDrop } from '../components/datasets/drag-n-drop/DragNDrop';
import { IAppState } from '_/renderer/state/reducers';
import { changeActiveDataset } from '_/renderer/state/active-dataset-page/ActiveDatasetActions';
import { IChangeActiveDatasetAction } from '_/renderer/state/active-dataset-page/model/actionTypes';
import { IActiveDatasetReducer } from '_/renderer/state/active-dataset-page/model/reducerTypes';
import { useVerticalScrollbar } from '_/renderer/view/helpers/hooks/scrollbar';
import { changeSelectedPageAction } from '_/renderer/state/side-menu/SideModelAction';
import { MODELS_PAGE } from '../helpers/constants/pageConstants';
import { IChangeSelectedPageAction } from '_/renderer/state/side-menu/model/actionTypes';
import ErrorBoundaryReplace from '../components/error-boundaries/ErrorBoundaryReplace';

interface Props {
	activeDataset: IActiveDatasetReducer;
	changeActiveDataset: (activeDataset: Dataset, labels: Labels) => IChangeActiveDatasetAction;
	changeSelectedPage: (pageNumber: number) => IChangeSelectedPageAction;
}

type DatasetPageParams = {
	id: string;
};

const DatasetPage = React.memo(({ activeDataset, changeActiveDataset, changeSelectedPage }: Props) => {
	const { id: datasetID } = useParams<DatasetPageParams>();
	// const [dataset, setDataset] = useState<Dataset | undefined>(undefined);

	const [isLargerThan1280] = useMediaQuery('(min-width: 1280px)');
	const verticalScrollbar = useVerticalScrollbar('10px');
	const borderColor = mode('thia.gray.200', 'thia.gray.600');
	const cardBG = mode('thia.gray.50', 'thia.gray.700');

	const refreshDataset = async () => {
		if (!datasetID) return;

		const [datasetError, datasetResData] = await EngineRequestHandler.getInstance().getDataset(datasetID);
		const [datasetLabelsError, datasetLabelsResData] = await EngineRequestHandler.getInstance().getDatasetLabels(
			datasetID,
		);
		if (!datasetError && !datasetLabelsError) {
			changeActiveDataset(datasetResData, datasetLabelsResData);
		}
	};

	useEffect(() => {
		changeSelectedPage(MODELS_PAGE);
	}, []);

	useEffect(() => {
		refreshDataset();
	}, [datasetID]);

	useEffect(() => {
		// cleanup when dataset page is unmounted
		return () => {
			changeActiveDataset(nullDataset, {});
		};
	}, []);

	return (
		<VStack
			py='2'
			px='6'
			spacing='4'
			alignItems='flex-start'
			w='full'
			h='full'
			marginTop='var(--header-height)'
			overflowY='auto'
			sx={verticalScrollbar}>
			<VStack alignItems='flex-start' ml='4'>
				<Skeleton w='400px' isLoaded={activeDataset.value.dataset !== undefined}>
					<HStack pt='1' alignItems='center'>
						<Text pb='1' as='h3' fontWeight='bold' fontSize='lg' noOfLines={1}>
							{activeDataset.value.dataset?.name}:
						</Text>
						<Badge fontSize='sm' colorScheme='purple' ml='1'>
							{getVerboseModelType(activeDataset.value.dataset?.type)}
						</Badge>
					</HStack>
				</Skeleton>
				<InteractiveCopyBadge badgeID={activeDataset.value.dataset?.id} />
			</VStack>
			<Box
				w={isLargerThan1280 ? '90%' : 'full'}
				py='6'
				willChange='width'
				transition='width 200ms'
				alignSelf='center'
				px='8'
				rounded='lg'
				borderWidth='1px'
				borderColor={borderColor}
				bg={cardBG}
				shadow='lg'>
				<Box mb='8'>
					<Text as='h3' fontWeight='bold' fontSize='lg'>
						Upload Images
					</Text>
					<Text color={mode('thia.gray.700', 'thia.gray.300')} fontSize='sm'>
						Select images to transfer to dataset
					</Text>
				</Box>
				<ErrorBoundaryReplace replacePath='/models'>
					<DragNDrop refreshDataset={refreshDataset} />
				</ErrorBoundaryReplace>
			</Box>
			<Spacer />
		</VStack>
	);
});

DatasetPage.displayName = 'DatasetPage';

const mapStateToProps = (state: IAppState) => ({
	activeDataset: state.activeDataset,
});

export default connect(mapStateToProps, {
	changeActiveDataset,
	changeSelectedPage: changeSelectedPageAction,
})(DatasetPage);
