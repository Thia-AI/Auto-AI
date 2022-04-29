import {
	Box,
	Text,
	useMediaQuery,
	chakra,
	Wrap,
	Icon,
	Heading,
	ChakraComponent,
	HStack,
	Spacer,
	Spinner,
	useToast,
} from '@chakra-ui/react';
import React, { useEffect, useState } from 'react';
import { Export, Model, ModelExportType, PossibleModelExportTypes } from '../../helpers/constants/engineDBTypes';
import TensorFlowLogo from '_utils/images/TensorFlow Brand Assets/TensorFlow Logo/Primary/SVG/FullColorPrimary Icon.svg';
import { EngineActionHandler } from '_/renderer/engine-requests/engineActionHandler';
import { OpenDialogReturnValue, ipcRenderer } from 'electron';
import { IPC_DRAG_AND_DROP_SELECT_FOLDER } from '_/shared/ipcChannels';
import { waitTillEngineJobComplete, waitTillEngineJobCompleteInterval } from '../../helpers/functionHelpers';

interface Props {
	model: Model;
}

const CharkaTensorFlowLogo = chakra(TensorFlowLogo);

/**
 * Section in model page for exporting the model.
 */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export const ExportModel = React.memo(({ model }: Props) => {
	const [isLargerThan1280] = useMediaQuery('(min-width: 1280px)');

	const [modelExportDisabled, setModelExportDisabled] = useState(true);

	const [savedModelExporting, setSavedModelExporting] = useState(false);
	const [liteExporting, setLiteExporting] = useState(false);
	const [jsExporting, setJsExporting] = useState(false);

	const [exportModelEngineResponse, setExportModelEngineResponse] = useState<[boolean, any] | null>(null);
	const [exportModelJobWatchIntervalID, setExportModelJobWatchIntervalID] = useState<number | null>(null);

	useEffect(() => {
		// Once export job has finished.
		if (exportModelEngineResponse) {
			setExportModelEngineResponse(null);
			setModelExportDisabled(false);
			setSavedModelExporting(false);
			setLiteExporting(false);
			setJsExporting(false);
		}
	}, [exportModelEngineResponse]);

	useEffect(() => {
		// Clear interval for waiting for export job to complete
		// because component unmounted.
		return () => {
			if (exportModelJobWatchIntervalID) {
				clearInterval(exportModelJobWatchIntervalID);
			}
		};
	}, [exportModelJobWatchIntervalID]);

	useEffect(() => {
		const checkIfAnyActiveExportJobs = async () => {
			const [activeExportError, activeExportResData] =
				await EngineActionHandler.getInstance().getActiveModelExports(model.id);
			if (!activeExportError && activeExportResData['exports']) {
				const activeExport: Export[] = activeExportResData['exports'];
				let savedModelExporting = false;
				let liteModelExporting = false;
				let jsModelExporting = false;
				activeExport.forEach((activeExport) => {
					if (activeExport.export_type == 'SAVED_MODEL') {
						savedModelExporting = true;
						setSavedModelExporting(true);
					} else if (activeExport.export_type == 'LITE') {
						liteModelExporting = true;
						setLiteExporting(true);
					} else if (activeExport.export_type == 'JS') {
						jsModelExporting = true;
						setJsExporting(true);
					}
					// Wait till export job has completed
					setExportModelJobWatchIntervalID(
						waitTillEngineJobCompleteInterval(activeExport.export_job_id, setExportModelEngineResponse),
					);
				});

				setModelExportDisabled(savedModelExporting || liteModelExporting || jsModelExporting);
			} else {
				setModelExportDisabled(false);
			}
		};

		checkIfAnyActiveExportJobs();
	}, []);
	return (
		<Box
			w={isLargerThan1280 ? '90%' : 'full'}
			py='6'
			willChange='width'
			transition='width 200ms'
			alignSelf='center'
			px='8'
			rounded='lg'
			bg='gray.700'
			shadow='base'>
			<Box mb='8' w='full'>
				<Text as='h3' fontWeight='bold' fontSize='lg'>
					Export
				</Text>
				<Text color='gray.500' fontSize='sm'>
					Export your model in the format you need.
				</Text>
			</Box>
			<Wrap
				mt='4'
				spacing='4'
				shouldWrapChildren
				justify='space-evenly'
				direction={{ base: 'column', md: 'row' }}>
				<ExtraModelTypeButton
					iconSrc={CharkaTensorFlowLogo}
					title='TF SavedModel'
					exportType={ModelExportType.SAVED_MODEL}
					modelID={model.id}
					setExportModelEngineResponse={setExportModelEngineResponse}
					exporting={savedModelExporting}
					setExporting={setSavedModelExporting}
					setIsDisabled={setModelExportDisabled}
					setExportModelJobWatchIntervalID={setExportModelJobWatchIntervalID}
					isDisabled={modelExportDisabled}
					description='Export your model in a TF SavedModel format to run your model on desktop devices or docker container.'
				/>
				<ExtraModelTypeButton
					iconSrc={CharkaTensorFlowLogo}
					title='TF Lite'
					exportType={ModelExportType.LITE}
					modelID={model.id}
					exporting={liteExporting}
					setExportModelEngineResponse={setExportModelEngineResponse}
					setExporting={setLiteExporting}
					setIsDisabled={setModelExportDisabled}
					setExportModelJobWatchIntervalID={setExportModelJobWatchIntervalID}
					isDisabled={modelExportDisabled}
					description='Export your model in a TF Lite format to run your model on the edge or mobile devices.'
				/>
			</Wrap>
		</Box>
	);
});

ExportModel.displayName = 'ExportModel';

interface ExtraModelTypeButton {
	title: string;
	description: string;
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	iconSrc: ChakraComponent<any, {}>;
	modelID: string;
	exporting: boolean;
	setExporting: (exporting: boolean) => void;
	setExportModelEngineResponse: (engineResponse: [boolean, any] | null) => void;
	setExportModelJobWatchIntervalID: (intervalID: number | null) => void;
	exportType: PossibleModelExportTypes;
	isDisabled: boolean;
	setIsDisabled: (isDisabled: boolean) => void;
}

const ExtraModelTypeButton = React.memo(
	({
		title,
		description,
		iconSrc,
		isDisabled,
		modelID,
		exportType,
		setExportModelJobWatchIntervalID,
		setExportModelEngineResponse,
		exporting,
		setExporting,
		setIsDisabled,
	}: ExtraModelTypeButton) => {
		const toast = useToast();

		const exportModel = async () => {
			if (!isDisabled) {
				const folder: OpenDialogReturnValue = await ipcRenderer.invoke(
					IPC_DRAG_AND_DROP_SELECT_FOLDER,
					'Select Folder to Export Model to',
				);
				if (folder.canceled) return;
				setExporting(true);
				setIsDisabled(true);
				const [exportModelErrorExists, exportModelResData] =
					await EngineActionHandler.getInstance().exportModel(modelID, {
						export_type: exportType,
						save_dir: folder.filePaths[0],
					});
				if (exportModelErrorExists) {
					toast({
						title: 'Error',
						description: `${exportModelResData['Error']}`,
						status: 'error',
						duration: 1500,
						isClosable: false,
					});
					setExporting(false);
					setIsDisabled(false);
					return;
				}
				// Wait till export job has completed
				setExportModelJobWatchIntervalID(
					waitTillEngineJobCompleteInterval(exportModelResData['ids'][0], setExportModelEngineResponse),
				);
			}
		};
		return (
			<Box
				px='4'
				py='4'
				pt='1'
				opacity={isDisabled ? '0.4' : '1'}
				bg='gray.750'
				rounded='sm'
				onClick={exportModel}
				cursor={isDisabled ? 'not-allowed' : 'pointer'}
				willChange='transform'
				transition='all 200ms ease'
				_hover={
					!isDisabled
						? {
								transform: 'scale(1.03)',
						  }
						: {}
				}>
				<HStack>
					<Icon as={iconSrc} w={12} h={12} />
					<Spacer />
					<Spinner size='sm' display={exporting ? 'initial' : 'none'} />
				</HStack>
				<Heading as='h6' size='sm'>
					{title}
				</Heading>
				<Text mt='1' fontSize='13px' color='gray.400' fontWeight='thin' as='p' maxW='250px' textAlign='left'>
					{description}
				</Text>
			</Box>
		);
	},
);

ExtraModelTypeButton.displayName = 'ExtraModelTypeButton';
