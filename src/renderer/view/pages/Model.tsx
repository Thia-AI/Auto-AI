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
	IconButton,
	MenuList,
	MenuItem,
	useDisclosure,
} from '@chakra-ui/react';
import { useState } from 'react';
import { useParams } from 'react-router-dom';

import { getVerboseModelType } from '_view_helpers/modelHelper';
import { EngineRequestHandler } from '_/renderer/engine-requests/engineRequestHandler';
import { HorizontalDatasetPreview } from '../components/datasets/model-horizontal/HorizontalDatasetPreview';
import { Model as ModelPage, ModelStatus, nullModel } from '../helpers/constants/engineTypes';
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
import { To } from 'history';
import { replace, UpdateLocationAction } from '@lagunovsky/redux-react-router';
import { useUser } from 'reactfire';
import { BackButton } from '../components/routing/BackButton';

interface Props {
	selectedDatasetID: ISelectedDatasetReducer;
	resetSelectedDataset: () => IResetSelectedDatasetAction;
	changeSelectedPage: (pageNumber: number) => IChangeSelectedPageAction;
	replace: (to: To, state?) => UpdateLocationAction<'replace'>;
}

type ModelPageParams = {
	id: string;
};
const ModelPage = React.memo(({ selectedDatasetID, resetSelectedDataset, changeSelectedPage, replace }: Props) => {
	const { id: modelID } = useParams<ModelPageParams>();
	const [dataLoaded, setDataLoaded] = useState(false);
	const [model, setModel] = useState<ModelPage>(nullModel);
	const verticalScrollBarSX = useVerticalScrollbar('10px');

	const activeTrainJobRef = useRef<ActiveTrainJobHandle>(null);
	const { data: user } = useUser();
	const {
		isOpen: deleteModelDialogOpen,
		onOpen: openDeleteModelDialog,
		onClose: closeDeleteModelDialog,
	} = useDisclosure();

	const fetchModel = async () => {
		if (user && modelID) {
			const idToken = await user.getIdToken();
			const [error, resData] = await EngineRequestHandler.getInstance().getModel(modelID, idToken);
			if (!error) {
				setModel(resData);
				setDataLoaded(true);
			} else {
				// Failed to get model, route back to models page
				toast({
					title: 'Could not load model',
					description: resData['Error'],
					status: 'error',
					duration: 1500,
					isClosable: true,
					uid: user.uid,
					saveToStore: false,
				});
				replace('/models');
			}
		}
	};

	useEffect(() => {
		changeSelectedPage(MODELS_PAGE);
	}, []);

	useEffect(() => {
		fetchModel();
	}, [user, modelID]);

	const canTrainModel = () => {
		const status = model.model_status;
		return status == ModelStatus.IDLE || status == ModelStatus.ERROR;
	};

	const trainModel = async () => {
		if (!user) return;
		// Make sure a dataset is selected to be trained on
		if (selectedDatasetID.value.length > 0 && modelID) {
			const idToken = await user.getIdToken();
			const [error, trainModelResData] = await EngineRequestHandler.getInstance().trainModel(modelID, idToken, {
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
				toast({
					title: 'Cannot train model',
					description: trainModelResData['Error'],
					status: 'error',
					duration: 1500,
					uid: user.uid,
					isClosable: true,
					saveToStore: false,
				});
			}
		} else {
			// Dataset isn't selected
			toast({
				title: 'No dataset selected',
				description: 'Select a dataset to train on',
				status: 'error',
				duration: 1500,
				isClosable: true,
				uid: user.uid,
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
						<BackButton />
						<Text pb='1' as='h3' fontWeight='bold' fontSize='lg' noOfLines={1} ml='4'>
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
									title='Model Options'
									icon={<BsThreeDotsVertical />}
									colorScheme='thia.gray'
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
	replace,
})(ModelPage);
