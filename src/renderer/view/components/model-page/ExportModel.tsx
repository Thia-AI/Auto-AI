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
	useColorModeValue as mode,
	MenuButton,
	Menu,
	IconButton,
	MenuList,
	MenuItem,
} from '@chakra-ui/react';
import React, { useEffect, useState } from 'react';
import { Export, Model, ModelExportType, PossibleModelExportTypes } from '../../helpers/constants/engineTypes';
import TensorFlowLogo from '_utils/images/TensorFlow Brand Assets/TensorFlow Logo/Primary/SVG/FullColorPrimary Icon.svg';
import { EngineRequestHandler } from '_/renderer/engine-requests/engineRequestHandler';
import { OpenDialogReturnValue, ipcRenderer } from 'electron';
import { IPC_DRAG_AND_DROP_SELECT_FOLDER } from '_/shared/ipcChannels';
import { toast, waitTillEngineJobCompleteInterval } from '../../helpers/functionHelpers';
import { BsThreeDotsVertical } from 'react-icons/bs';
import { useUser } from 'reactfire';

interface Props {
	model: Model;
}

const CharkaTensorFlowLogo = chakra(TensorFlowLogo);

/**
 * Section in model page for exporting the model.
 */
export const ExportModel = React.memo(({ model }: Props) => {
	const [isLargerThan1280] = useMediaQuery('(min-width: 1280px)');

	const [modelExportDisabled, setModelExportDisabled] = useState(true);
	const [savedModelExporting, setSavedModelExporting] = useState(false);
	const [liteExporting, setLiteExporting] = useState(false);
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	const [exportModelEngineResponse, setExportModelEngineResponse] = useState<[boolean, any] | null>(null);
	const [exportModelJobWatchIntervalID, setExportModelJobWatchIntervalID] = useState<number | null>(null);

	const borderColor = mode('thia.gray.200', 'thia.gray.600');
	const cardBG = mode('thia.gray.50', 'thia.gray.700');

	useEffect(() => {
		// Once export job has finished.
		if (exportModelEngineResponse) {
			setExportModelEngineResponse(null);
			setModelExportDisabled(false);
			setSavedModelExporting(false);
			setLiteExporting(false);
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
				await EngineRequestHandler.getInstance().getActiveModelExports(model.id);
			if (!activeExportError && activeExportResData['exports']) {
				const activeExport: Export[] = activeExportResData['exports'];
				let savedModelExporting = false;
				let liteModelExporting = false;
				activeExport.forEach((activeExport) => {
					if (activeExport.export_type == 'SAVED_MODEL') {
						savedModelExporting = true;
						setSavedModelExporting(true);
					} else if (activeExport.export_type == 'LITE') {
						liteModelExporting = true;
						setLiteExporting(true);
					}
					// Wait till export job has completed
					setExportModelJobWatchIntervalID(
						waitTillEngineJobCompleteInterval(activeExport.export_job_id, setExportModelEngineResponse),
					);
				});

				setModelExportDisabled(savedModelExporting || liteModelExporting);
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
			borderWidth='1px'
			borderColor={borderColor}
			bg={cardBG}
			shadow='lg'>
			<HStack mb='8' w='full'>
				<Box>
					<Text as='h3' fontWeight='bold' fontSize='lg'>
						Export
					</Text>
					<Text color={mode('thia.gray.700', 'thia.gray.300')} fontSize='sm'>
						Export your model in the format you need.
					</Text>
				</Box>
				<Spacer />
				<Box>
					<Menu autoSelect isLazy lazyBehavior='keepMounted' closeOnSelect={false}>
						<MenuButton
							as={IconButton}
							aria-label='Export Options'
							title='Export Options'
							icon={<BsThreeDotsVertical />}
							colorScheme='thia.gray'
							variant='ghost'
						/>
						<MenuList px='3'>
							<MenuItem
								rounded='md'
								onClick={async () => {
									EngineRequestHandler.getInstance().downloadLabelsCSV(model.id);
								}}>
								Download Labels
							</MenuItem>
						</MenuList>
					</Menu>
				</Box>
			</HStack>
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
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
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
		const buttonBG = mode('thia.gray.50', 'thia.gray.800');
		const buttonShadow = mode('sm', 'lg-dark');
		const borderColor = mode('thia.gray.200', 'thia.gray.600');
		const { data: user } = useUser();

		const exportModel = async () => {
			if (!isDisabled && user) {
				const folder: OpenDialogReturnValue = await ipcRenderer.invoke(
					IPC_DRAG_AND_DROP_SELECT_FOLDER,
					'Select Folder to Export Model to',
				);
				if (folder.canceled) return;
				setExporting(true);
				setIsDisabled(true);
				const idToken = await user.getIdToken();
				const [exportModelErrorExists, exportModelResData] =
					await EngineRequestHandler.getInstance().exportModel(modelID, idToken, {
						export_type: exportType,
						save_dir: folder.filePaths[0],
					});
				if (exportModelErrorExists) {
					// TODO: Pass model instead of modelID so we can display the name of the model for which export failed.
					toast({
						title: 'Failed to export model',
						description: `${exportModelResData['Error']}`,
						status: 'error',
						duration: 1500,
						isClosable: false,
						uid: user.uid,
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
				bg={buttonBG}
				rounded='sm'
				onClick={exportModel}
				cursor={isDisabled ? 'not-allowed' : 'pointer'}
				willChange='transform'
				transition='all 200ms ease'
				_hover={!isDisabled ? { transform: 'scale(1.03)' } : {}}
				borderWidth='1px'
				borderColor={borderColor}
				shadow={buttonShadow}>
				<HStack>
					<Icon as={iconSrc} w={12} h={12} />
					<Spacer />
					<Spinner size='sm' display={exporting ? 'initial' : 'none'} />
				</HStack>
				<Heading as='h6' size='sm'>
					{title}
				</Heading>
				<Text
					mt='1'
					fontSize='13px'
					color={mode('thia.gray.700', 'thia.gray.300')}
					fontWeight='thin'
					as='p'
					maxW='250px'
					textAlign='left'>
					{description}
				</Text>
			</Box>
		);
	},
);

ExtraModelTypeButton.displayName = 'ExtraModelTypeButton';
