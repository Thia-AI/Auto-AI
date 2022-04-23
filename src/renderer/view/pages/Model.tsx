import React, { useEffect } from 'react';

import { Center, VStack, Text, HStack, Badge, Skeleton, Spacer, Button, useToast } from '@chakra-ui/react';
import { useState } from 'react';
import { useRouteMatch } from 'react-router-dom';

import { getVerboseModelType } from '_view_helpers/modelHelper';
import { EngineActionHandler } from '_engine_requests/engineActionHandler';
import { HorizontalDatasetPreview } from '../components/datasets/model-horizontal/HorizontalDatasetPreview';
import { Model as ModelPage, ModelStatus, nullModel } from '../helpers/constants/engineDBTypes';
import { connect } from 'react-redux';
import { IAppState } from '_/renderer/state/reducers';
import { ISelectedDatasetReducer } from '_/renderer/state/choose-dataset-train/model/reducerTypes';
import { ActiveTrainJob } from '../components/model-page/ActiveTrainJob';
import { IResetSelectedDatasetAction } from '_/renderer/state/choose-dataset-train/model/actionTypes';
import { resetSelectedDatasetAction } from '_/renderer/state/choose-dataset-train/ChooseDatasetActions';
import { TestModel } from '../components/model-page/TestModel';
import { ExportModel } from '../components/model-page/ExportModel';

interface Props {
	selectedDatasetID: ISelectedDatasetReducer;
	resetSelectedDataset: () => IResetSelectedDatasetAction;
}
const ModelPage = React.memo(({ selectedDatasetID, resetSelectedDataset }: Props) => {
	const modelID = useRouteMatch().params['id'];
	const [dataLoaded, setDataLoaded] = useState(false);
	const [model, setModel] = useState<ModelPage>(nullModel);
	const toast = useToast();

	const fetchModel = async () => {
		const [error, resData] = await EngineActionHandler.getInstance().getModel(modelID);
		if (!error) {
			setModel(resData);
		}
		setDataLoaded(true);
	};

	useEffect(() => {
		fetchModel();
	}, []);

	const canTrainModel = () => {
		const status = model.model_status;
		return status == ModelStatus.IDLE || status == ModelStatus.ERROR;
	};

	const trainModel = async () => {
		// Make sure a dataset is selected to be trained on
		if (selectedDatasetID.value.length > 0) {
			// eslint-disable-next-line @typescript-eslint/no-unused-vars
			const [error, _] = await EngineActionHandler.getInstance().trainModel(modelID, {
				dataset_id: selectedDatasetID.value,
			});
			if (!error) {
				// Add toast
				resetSelectedDataset();
				await fetchModel();
			} else {
				console.log('damn');
			}
		} else {
			// Dataset isn't selected
			toast({
				title: 'Error',
				description: 'Select a dataset to train on',
				status: 'error',
				duration: 1500,
				isClosable: true,
			});
		}
	};

	const renderActiveTrainingJob = () => {
		if (model.latest_train_job_id) {
			return <ActiveTrainJob trainJobID={model.latest_train_job_id} fetchModel={fetchModel} />;
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
		<VStack
			px='6'
			w='full'
			spacing='4'
			h='full'
			alignItems='flex-start'
			marginTop='var(--header-height)'
			py='4'
			overflowY='auto'
			sx={{
				'&::-webkit-scrollbar': {
					w: '10px',
					bg: 'gray.600',
				},
				'&::-webkit-scrollbar-thumb': {
					bg: 'gray.900',
				},
			}}>
			<Skeleton w='400px' mb='6' isLoaded={model.id.length != 0}>
				<HStack pt='1' alignItems='center'>
					<Text pb='1' as='h3' fontWeight='bold' fontSize='lg' isTruncated ml='4'>
						{model.model_name}:
					</Text>
					<Badge fontSize='sm' colorScheme='purple' ml='1'>
						{getVerboseModelType(model.model_type)}
					</Badge>
				</HStack>
			</Skeleton>
			<HorizontalDatasetPreview modelType={model.model_type} />
			{renderActiveTrainingJob()}
			{renderTestModel()}
			{renderExportModel()}
			<Spacer />
			<Center w='full'>
				<Button colorScheme='blue' isDisabled={!canTrainModel()} isLoading={!dataLoaded} onClick={trainModel}>
					Train
				</Button>
			</Center>
		</VStack>
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
})(ModelPage);
