import React, { useEffect, useRef } from 'react';

import {
	Center,
	VStack,
	Text,
	HStack,
	Badge,
	Skeleton,
	Spacer,
	Button,
	Box,
	Menu,
	MenuButton,
	useColorModeValue as mode,
	IconButton,
	MenuList,
	MenuItem,
	useDisclosure,
} from '@chakra-ui/react';
import { useState } from 'react';
import { useRouteMatch } from 'react-router-dom';

import { getVerboseModelType } from '_view_helpers/modelHelper';
import { EngineRequestHandler } from '_/renderer/engine-requests/engineRequestHandler';
import { HorizontalDatasetPreview } from '../components/datasets/model-horizontal/HorizontalDatasetPreview';
import { Model as ModelPage, ModelStatus, nullModel } from '../helpers/constants/engineDBTypes';
import { connect } from 'react-redux';
import { IAppState } from '_/renderer/state/reducers';
import { ISelectedDatasetReducer } from '_/renderer/state/choose-dataset-train/model/reducerTypes';
import { ActiveTrainJob, ActiveTrainJobHandle } from '../components/model-page/ActiveTrainJob';
import { IResetSelectedDatasetAction } from '_/renderer/state/choose-dataset-train/model/actionTypes';
import { resetSelectedDatasetAction } from '_/renderer/state/choose-dataset-train/ChooseDatasetActions';
import { TestModel } from '../components/model-page/TestModel';
import { ExportModel } from '../components/model-page/ExportModel';
import { BsThreeDotsVertical } from 'react-icons/bs';
import { DeleteModel } from '../components/model-page/DeleteModel';
import { useVerticalScrollbar } from '_/renderer/view/helpers/hooks/scrollbar';
import { changeSelectedPageAction } from '_/renderer/state/side-menu/SideModelAction';
import { IChangeSelectedPageAction } from '_/renderer/state/side-menu/model/actionTypes';
import { MODELS_PAGE } from '../helpers/constants/pageConstants';
import { toast } from '../helpers/functionHelpers';

interface Props {
	selectedDatasetID: ISelectedDatasetReducer;
	resetSelectedDataset: () => IResetSelectedDatasetAction;
	changeSelectedPage: (pageNumber: number) => IChangeSelectedPageAction;
}
const ModelPage = React.memo(({ selectedDatasetID, resetSelectedDataset, changeSelectedPage }: Props) => {
	const modelID = useRouteMatch().params['id'];
	const [dataLoaded, setDataLoaded] = useState(false);
	const [model, setModel] = useState<ModelPage>(nullModel);
	const verticalScrollBarSX = useVerticalScrollbar('10px');
	const menuButtonBGHover = mode('thia.gray.200', 'thia.gray.700');
	const menuButtonBGClicking = mode('thia.gray.100', 'thia.gray.600');
	const activeTrainJobRef = useRef<ActiveTrainJobHandle>(null);

	const {
		isOpen: deleteModelDialogOpen,
		onOpen: openDeleteModelDialog,
		onClose: closeDeleteModelDialog,
	} = useDisclosure();

	const fetchModel = async () => {
		const [error, resData] = await EngineRequestHandler.getInstance().getModel(modelID);
		if (!error) {
			setModel(resData);
		}
		setDataLoaded(true);
	};

	useEffect(() => {
		changeSelectedPage(MODELS_PAGE);
		fetchModel();
	}, []);

	const canTrainModel = () => {
		const status = model.model_status;
		return status == ModelStatus.IDLE || status == ModelStatus.ERROR;
	};

	const trainModel = async () => {
		// Make sure a dataset is selected to be trained on
		if (selectedDatasetID.value.length > 0) {
			const [error, _] = await EngineRequestHandler.getInstance().trainModel(modelID, {
				dataset_id: selectedDatasetID.value,
			});
			if (!error) {
				// Add toast
				resetSelectedDataset();
				await fetchModel();
				if (activeTrainJobRef.current) {
					await activeTrainJobRef.current.refreshActiveTrainingJob();
				}
			} else {
				console.log('damn');
			}
		} else {
			// Dataset isn't selected
			toast({
				title: 'No dataset selected',
				description: 'Select a dataset to train on',
				status: 'error',
				duration: 1500,
				isClosable: true,
				saveToStore: false,
			});
		}
	};

	const renderActiveTrainingJob = () => {
		if (model.latest_train_job_id) {
			return (
				<ActiveTrainJob
					trainJobID={model.latest_train_job_id}
					fetchModel={fetchModel}
					ref={activeTrainJobRef}
				/>
			);
		}
	};

	const renderTestModel = () => {
		if (model.model_status == ModelStatus.TRAINED) {
			return <TestModel model={model} />;
		}
	};

	const renderExportModel = () => {
		if (model.model_status == ModelStatus.TRAINED) {
			return <ExportModel model={model} />;
		}
	};

	return (
		<>
			<VStack
				px='6'
				w='full'
				spacing='4'
				h='full'
				alignItems='flex-start'
				marginTop='var(--header-height)'
				py='4'
				overflowY='auto'
				sx={verticalScrollBarSX}>
				<Skeleton w='full' mb='6' isLoaded={model.id.length != 0}>
					<HStack pt='1' alignItems='center'>
						<Text pb='1' as='h3' fontWeight='bold' fontSize='lg' isTruncated ml='4'>
							{model.model_name}:
						</Text>
						<Badge fontSize='sm' colorScheme='purple' ml='1'>
							{getVerboseModelType(model.model_type)}
						</Badge>
						<Spacer />
						<Box>
							<Menu autoSelect isLazy lazyBehavior='keepMounted' closeOnSelect={false}>
								<MenuButton
									as={IconButton}
									aria-label='Model Options'
									icon={<BsThreeDotsVertical />}
									_hover={{
										bg: menuButtonBGHover,
									}}
									_active={{
										bg: menuButtonBGClicking,
									}}
									_focus={{
										bg: menuButtonBGHover,
									}}
									variant='ghost'
								/>
								<MenuList px='3'>
									<MenuItem
										bg='red.400'
										rounded='md'
										_active={{ bg: 'red.450' }}
										_hover={{ bg: 'red.500' }}
										_focus={{ bg: 'red.500' }}
										onClick={() => openDeleteModelDialog()}>
										Delete
									</MenuItem>
								</MenuList>
							</Menu>
						</Box>
					</HStack>
				</Skeleton>
				<HorizontalDatasetPreview modelType={model.model_type} />
				{renderActiveTrainingJob()}
				{renderTestModel()}
				{renderExportModel()}
				<Spacer />
				<Center w='full'>
					<Button
						colorScheme='thia.purple'
						isDisabled={!canTrainModel()}
						isLoading={!dataLoaded}
						onClick={trainModel}>
						Train
					</Button>
				</Center>
			</VStack>
			<DeleteModel dialogOpen={deleteModelDialogOpen} model={model} onClose={closeDeleteModelDialog} />
		</>
	);
});

ModelPage.displayName = 'ModelPage';

const mapStateToProps = (state: IAppState) => ({
	selectedDatasetID: state.selectedDataset,
});

/**
 * Page for rendering an individual model.
 */
export default connect(mapStateToProps, {
	resetSelectedDataset: resetSelectedDatasetAction,
	changeSelectedPage: changeSelectedPageAction,
})(ModelPage);
