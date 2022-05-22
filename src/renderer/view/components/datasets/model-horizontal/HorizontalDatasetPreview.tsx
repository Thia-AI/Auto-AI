import React, { useEffect } from 'react';
import {
	Box,
	Text,
	useMediaQuery,
	useColorModeValue as mode,
	HStack,
	Spacer,
	Button,
	useDisclosure,
	Spinner,
	Center,
} from '@chakra-ui/react';
import { connect } from 'react-redux';

import { getVerboseModelType } from '_view_helpers/modelHelper';
import { CreateDataset } from './CreateDataset';
import { DatasetCard, FillerDatasetCard } from './DatasetCard';
import { isFirstLetterVowel } from '_/renderer/view/helpers/textHelper';
import { DeleteDataset } from '../../delete-dataset/DeleteDataset';
import { refreshDatasetListAction } from '_/renderer/state/dataset-list/DatasetListActions';
import { IAppState } from '_/renderer/state/reducers';
import { IDatasetListReducer } from '_/renderer/state/dataset-list/model/reducerTypes';
import { useHorizontalScrollbar } from '_/shared/theming/hooks';

interface Props {
	modelType: string;
	refreshDataset: () => void;
	datasetList: IDatasetListReducer;
	datasetLoading: boolean;
}
const HorizontalDatasetPreviewC = React.memo((props: Props) => {
	const { isOpen, onOpen, onClose } = useDisclosure();
	const verboseModelType = getVerboseModelType(props.modelType);
	const [isLargerThan1280] = useMediaQuery('(min-width: 1280px)');
	const horizontalScrollBarSX = useHorizontalScrollbar('6px');
	const cardBG = mode('thia.gray.50', 'thia.gray.700');
	const color = mode('thia.gray.700', 'thia.gray.300');
	const borderColor = mode('thia.gray.200', 'thia.gray.600');

	useEffect(() => {
		props.refreshDataset();
	}, []);

	const renderCards = () => {
		if (props.datasetLoading) {
			return (
				<Center w='full' h='full'>
					<Spinner size='xl' color='gray.600' />
				</Center>
			);
		}
		if (props.datasetList.value.length < 1) {
			return <FillerDatasetCard />;
		}
		return props.datasetList.value.map((dataset, i) => {
			return <DatasetCard dataset={dataset} key={i} />;
		});
	};

	return (
		<>
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
				<HStack mb='8' w='full'>
					<Box>
						<Text as='h3' fontWeight='bold' fontSize='lg'>
							Datasets
						</Text>
						<Text color={color} fontSize='sm'>
							Select {isFirstLetterVowel(verboseModelType) ? 'an' : 'a'} {verboseModelType} dataset to
							train on
						</Text>
					</Box>
					<Spacer />
					<Button onClick={onOpen} variant='ghost' colorScheme='thia.purple'>
						Add
					</Button>
				</HStack>
				<HStack pl='2' w='full' minH='325px' spacing='4' overflowX='auto' pb='4' sx={horizontalScrollBarSX}>
					{renderCards()}
					{/* Extra div at the end so that there's some artificial padding */}
					<Box minH='1px' visibility='hidden' minW='1px' />
				</HStack>
			</Box>
			<CreateDataset onClose={onClose} isOpen={isOpen} />
			<DeleteDataset />
		</>
	);
});

HorizontalDatasetPreviewC.displayName = 'HorizontalDatasetPreview';

const mapStateToProps = (state: IAppState) => ({
	datasetList: state.datasetList,
	datasetLoading: state.datasetListLoading.value,
});

/**
 * Displays all datasets a model can be trained on.
 */
export const HorizontalDatasetPreview = connect(mapStateToProps, {
	refreshDataset: refreshDatasetListAction,
})(HorizontalDatasetPreviewC);
