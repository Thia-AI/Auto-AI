import React, { useEffect, useRef } from 'react';

import { Box, HStack, VStack, Text, Badge, Spacer, useMediaQuery, useColorModeValue as mode } from '@chakra-ui/react';
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
import { BackButton } from '../components/routing/BackButton';
import { Editable, EditableModelNameHandle } from '../components/editable/Editable';
import { string } from 'yup';
import { useUser } from 'reactfire';
import { toast } from '../helpers/functionHelpers';

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

	const { data: user } = useUser();

	const editableDatasetNameRef = useRef<EditableModelNameHandle>(null);

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

	const renameDataset = async (newDatasetName: string) => {
		if (!user || !datasetID) return;
		const idToken = await user.getIdToken();
		const [isError, resData] = await EngineRequestHandler.getInstance().renameDataset(datasetID, idToken, {
			new_dataset_name: newDatasetName,
		});
		if (!isError) {
			toast({
				title: 'Renaming Success',
				description: `Renamed dataset '${activeDataset.value.dataset?.name}' to '${newDatasetName}'`,
				status: 'success',
				duration: 3500,
				isClosable: true,
				uid: user.uid,
			});
			await refreshDataset();
		} else {
			toast({
				title: `Error When Renaming Dataset to ${newDatasetName}`,
				description: resData.Error,
				status: 'error',
				duration: 3500,
				isClosable: true,
				uid: user.uid,
			});
			// Reset editable value because an error happened in it's onSuccess method
			editableDatasetNameRef.current?.resetEditableValue(activeDataset.value.dataset?.name);
		}
	};

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
			<HStack pt='1' w='full' mb='7' alignItems='baseline'>
				<BackButton />
				<Badge fontSize='sm' colorScheme='purple' ml='1'>
					{getVerboseModelType(activeDataset.value.dataset?.type)}
				</Badge>

				<Editable
					ref={editableDatasetNameRef}
					initialValue={activeDataset.value.dataset?.name}
					validationSchema={string()
						.required('Cannot be empty')
						.min(3, 'Must be at least 3 characters long')
						.max(39, 'Must be less than 40 characters')
						.matches(/^\S+$/, 'No whitespace')
						.matches(/^[a-zA-Z0-9-_]+$/, 'Alphanumeric characters only')}
					onSuccess={renameDataset}
				/>

				<Spacer />
				<InteractiveCopyBadge badgeID={activeDataset.value.dataset?.id} />
			</HStack>
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
