import React, { useEffect, useRef } from 'react';

import {
	Center,
	VStack,
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
import { Model, ModelStatus, nullModel } from '../helpers/constants/engineTypes';
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
import { EditableModelName, EditableModelNameHandle } from '../components/model-page/EditableModelName';
import { string } from 'yup';

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
	const [model, setModel] = useState<Model>(nullModel);
	const verticalScrollBarSX = useVerticalScrollbar('10px');

	const activeTrainJobRef = useRef<ActiveTrainJobHandle>(null);
	const editableModelNameRef = useRef<EditableModelNameHandle>(null);

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
		return status == ModelStatus.IDLE || status == ModelStatus.ERROR || status == ModelStatus.CANCELLED;
	};

	const trainModel = async () => {
		if (!user) return;
		// Make sure a dataset is selected to be trained on
		if (selectedDatasetID.value.length === 0 && model.model_status !== ModelStatus.CANCELLED) {
			toast({
				title: 'Error',
				description: 'No dataset was selected',
				status: 'error',
				duration: 1500,
				uid: user.uid,
				isClosable: true,
				saveToStore: false,
			});
			return;
		}
		if (modelID) {
			const idToken = await user.getIdToken();
			// If resuming training, don't provide a dataset_id
			const dataset_id = model.model_status === ModelStatus.CANCELLED ? undefined : selectedDatasetID.value;
			const [error, trainModelResData] = await EngineRequestHandler.getInstance().trainModel(modelID, idToken, {
				dataset_id,
			});
			if (!error) {
				resetSelectedDataset();
				await fetchModel();
				setTimeout(async () => {
					if (activeTrainJobRef.current) {
						await activeTrainJobRef.current.refreshActiveTrainingJob();
					}
				}, 500);
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

	const renameModel = async (newModelName: string) => {
		if (!user) return;
		const [isError, resData] = await EngineRequestHandler.getInstance().renameModel(model.id, {
			new_model_name: newModelName,
		});
		if (!isError) {
			toast({
				title: 'Renaming Success',
				description: `Renamed model '${model.model_name}' to '${newModelName}'`,
				status: 'success',
				duration: 3500,
				isClosable: true,
				uid: user.uid,
			});
			await fetchModel();
		} else {
			toast({
				title: `Error When Renaming Model to ${newModelName}`,
				description: resData.Error,
				status: 'error',
				isClosable: true,
				uid: user.uid,
			});
			// Reset editable value because an error happened in it's onSuccess method
			editableModelNameRef.current?.resetEditableValue(model.model_name);
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
					<HStack pt='1' alignItems='baseline'>
						<BackButton />
						<Badge fontSize='sm' colorScheme='purple' ml='1'>
							{getVerboseModelType(model.model_type)}
						</Badge>

						<EditableModelName
							ref={editableModelNameRef}
							model={model}
							validationSchema={string()
								.required('Cannot be empty')
								.min(3, 'Must be at least 3 characters long')
								.max(39, 'Must be less than 40 characters')
								.matches(/^\S+$/, 'No whitespace')
								.matches(/^[a-zA-Z0-9-_]+$/, 'Alphanumeric characters only')}
							onSuccess={renameModel}
						/>
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
						{model.model_status === ModelStatus.CANCELLED ? 'Resume Training' : 'Train'}
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
