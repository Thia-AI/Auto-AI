import {
	Box,
	HStack,
	chakra,
	Text,
	useMediaQuery,
	useColorModeValue as mode,
	Spacer,
	VStack,
	ThemingProps,
	Skeleton,
	Badge,
	Progress,
	SkeletonText,
	shouldForwardProp,
	Wrap,
	Flex,
	useColorMode,
	IconButton,
	useDisclosure,
} from '@chakra-ui/react';
import React, { forwardRef, useEffect, useImperativeHandle, useState } from 'react';
import isValidHTMLProp from '@emotion/is-prop-valid';

import { EngineRequestHandler } from '_/renderer/engine-requests/engineRequestHandler';
import ReactApexChart from 'react-apexcharts';
import { ApexOptions } from 'apexcharts';
import { nullTrainJob, TrainJob, TrainJobStatus } from '../../helpers/constants/engineTypes';
import { InteractiveCopyBadge } from '../interactive/InteractiveCopyBadge';
import { argmin, toast } from '../../helpers/functionHelpers';
import { StatWithLearnMore } from '../stats/StatWithLearnMore';
import { ImCancelCircle } from 'react-icons/im';
import { useUser } from 'reactfire';
import { CancelTraining } from './CancelTraining';

/**
 * useImperativeHandle data.
 */
export interface ActiveTrainJobHandle {
	refreshActiveTrainingJob: () => Promise<void>;
}
interface Props {
	trainJobID: string;
	fetchModel: () => Promise<void>;
}

const ChakraReactApexChart = chakra(ReactApexChart, {
	shouldForwardProp: (prop) => {
		if (['type', 'series', 'width', 'height', 'options'].includes(prop)) {
			return true;
		}
		// don't forward Chakra's props
		const isChakraProp = !shouldForwardProp(prop);
		if (isChakraProp) return false;

		// forward valid HTML props
		const isValidProp = isValidHTMLProp(prop);
		if (isValidProp) return true;

		return false;
	},
});

interface ApexChartSeriesItem {
	name: string;
	data: number[];
}

/**
 * Component that renders the UI in a model page when a train job ID is present.
 * Renders training status and evaluation metrics.
 */
export const ActiveTrainJob = React.memo(
	forwardRef<ActiveTrainJobHandle, Props>(({ trainJobID, fetchModel }: Props, ref) => {
		const trainingJobIntervalRetrievalTimeMS = 750;
		const [trainingJob, setTrainingJob] = useState<TrainJob>(nullTrainJob);
		const [trainingJobIntervalID, setTrainingJobIntervalID] = useState<number>();
		const [isInitialDataLoaded, setIsInitialDataLoaded] = useState(false);
		const [isTrainingCancelling, setIsTrainingCancelling] = useState(false);
		const [isLargerThan1280] = useMediaQuery('(min-width: 1280px)');
		const [accuracySeries, setAccuracySeries] = useState<ApexChartSeriesItem[]>([]);
		const [lossSeries, setLossSeries] = useState<ApexChartSeriesItem[]>([]);
		const { data: user } = useUser();

		const { colorMode } = useColorMode();
		const sectionTextColor = mode('thia.gray.700', 'thia.gray.300');
		const borderColor = mode('thia.gray.200', 'thia.gray.600');
		const evaluationCardBG = mode('thia.gray.50', 'thia.gray.800');
		const sectionBG = mode('thia.gray.50', 'thia.gray.700');
		const trainingJobProgressTextColor = mode('thia.gray.700', 'thia.gray.300');
		const graphBestPointBG = mode('var(--chakra-colors-thia-purple-450)', 'var(--chakra-colors-thia-purple-400)');
		const graphBestPointColor = mode('var(--chakra-colors-thia-gray-100)', 'var(--chakra-colors-thia-gray-100)');

		const {
			isOpen: isCancelTrainingDialogOpen,
			onOpen: openCancelTrainingDialog,
			onClose: closeCancelTrainingDialog,
		} = useDisclosure();

		const roundPercentage = (element: number) => {
			return Number((element * 100).toFixed(2));
		};

		const roundNumber = (element: number) => {
			return Number(element.toFixed(4));
		};

		const baseApexChartOptions: ApexOptions = {
			theme: {
				mode: colorMode,
			},
			chart: {
				redrawOnWindowResize: true,
				redrawOnParentResize: true,
				type: 'area',
				background: 'gray.750',
				animations: {
					dynamicAnimation: {
						speed: 550,
					},
				},
				toolbar: {
					tools: {
						download: false,
						selection: false,
						pan: false,
						reset: false,
						zoom: false,
						zoomin: false,
						zoomout: false,
					},
				},
			},
			dataLabels: {
				enabled: false,
			},
			stroke: {
				curve: 'smooth',
			},
			xaxis: {
				title: {
					text: 'Epochs',
				},
			},
			tooltip: {
				x: {
					show: false,
					formatter: (val) => `Epochs: ${val}`,
				},
			},
		};
		const [lossArgMin, lossMin] = argmin(trainingJob.extra_data?.history?.val_loss);

		const accuracyApexChartOptions: ApexOptions = {
			...baseApexChartOptions,
			yaxis: {
				title: {
					text: 'Accuracy',
				},
				labels: {
					formatter: (val) => `${val}%`,
				},
			},
			title: {
				text: 'Accuracy vs Epochs Training Log',
				style: {
					fontSize: '12px',
				},
			},
		};

		const lossApexChartOptions: ApexOptions = {
			...baseApexChartOptions,
			yaxis: {
				title: {
					text: 'Loss',
				},
			},
			title: {
				text: 'Loss vs Epochs Training Log',
				style: {
					fontSize: '12px',
				},
			},
		};

		if (lossArgMin !== -1) {
			lossApexChartOptions.annotations = {
				...lossApexChartOptions.annotations,
				points: [
					{
						x: lossArgMin + 1,
						y: lossMin,
						marker: {
							size: 4,
							strokeWidth: 1,
							fillColor: graphBestPointBG,
						},
						label: {
							borderColor: '#FF4560',
							borderWidth: 0,
							borderRadius: 1,
							text: 'BEST',
							offsetY: 5,
							style: {
								background: graphBestPointBG,
								color: graphBestPointColor,
								padding: {
									left: 4,
									right: 4,
								},
							},
						},
					},
				],
			};
			accuracyApexChartOptions.annotations = {
				...accuracyApexChartOptions.annotations,
				points: [
					{
						x: lossArgMin + 1,
						y: roundPercentage(trainingJob.extra_data?.history?.val_accuracy[lossArgMin] ?? 0),
						marker: {
							size: 4,
							strokeWidth: 1,
							fillColor: graphBestPointBG,
						},
						label: {
							borderColor: '#FF4560',
							borderWidth: 0,
							borderRadius: 1,
							text: 'BEST',
							offsetY: 5,
							style: {
								background: graphBestPointBG,
								color: graphBestPointColor,
								padding: {
									left: 4,
									right: 4,
								},
							},
						},
					},
				],
			};
		}

		const statusColor = (): ThemingProps['colorScheme'] => {
			if (trainingJob.extra_data?.status) {
				switch (trainingJob.extra_data.status) {
					case TrainJobStatus.TRAINED:
					case TrainJobStatus.EVALUATED:
						return 'thia.purple';
					case TrainJobStatus.TRAINING:
					case TrainJobStatus.STARTING_TRAINING:
						return 'green';
					case TrainJobStatus.EVALUATING:
						return 'orange';
					case TrainJobStatus.ERROR:
					case TrainJobStatus.CANCELLED:
						return 'red';
					default:
						return 'thia.gray';
				}
			}
			return 'gray';
		};
		const getTrainingJob = async () => {
			const [error, resData] = await EngineRequestHandler.getInstance().getTrainJob(trainJobID);
			if (!error) {
				setTrainingJob(resData);
				// Set data loaded if it is the first time
				if (!isInitialDataLoaded) {
					setIsInitialDataLoaded(true);
				}
			}
		};

		const refreshActiveTrainingJob = async () => {
			// Get train job right away
			await getTrainingJob();
			// Set interval
			if (!trainingJobIntervalID) {
				const intervalID = window.setInterval(getTrainingJob, trainingJobIntervalRetrievalTimeMS);
				setTrainingJobIntervalID(intervalID);
			}
		};

		const cancelTraining = async () => {
			const trainingJobStatus = trainingJob.extra_data?.status;
			if (
				(trainingJobStatus === TrainJobStatus.STARTING_TRAINING ||
					trainingJobStatus === TrainJobStatus.TRAINING) &&
				user
			) {
				setIsTrainingCancelling(true);
				const [_, cancelJobResData] = await EngineRequestHandler.getInstance().cancelJob(trainJobID);
				if (cancelJobResData['job_cancelled_successfully']) {
					// Job cancelled successfully
					toast({
						title: 'Train Job Cancelled',
						description: 'Training job cancelled successfully',
						status: 'info',
						duration: 1500,
						isClosable: false,
						uid: user.uid,
					});
				} else {
					// Job failed to cancel
					toast({
						title: 'Train Job Cancellation Failed',
						description: 'Failed to cancel training job successfully',
						status: 'error',
						duration: 1500,
						isClosable: false,
						uid: user.uid,
					});
				}
				await refreshActiveTrainingJob();
				setIsTrainingCancelling(false);
			}
		};

		useImperativeHandle(ref, () => ({
			refreshActiveTrainingJob,
		}));

		useEffect(() => {
			refreshActiveTrainingJob();
		}, []);

		// Clear interval when unmounting
		useEffect(() => {
			return () => {
				if (trainingJobIntervalID) {
					clearInterval(trainingJobIntervalID);
					setTrainingJobIntervalID(undefined);
				}
			};
		}, [trainingJobIntervalID]);

		// Clear interval when evaluated
		useEffect(() => {
			// If training job's status is EVALUATED, clear interval
			const trainingJobStatus = trainingJob.extra_data?.status;
			if (
				(trainingJobStatus == TrainJobStatus.EVALUATED ||
					trainingJobStatus == TrainJobStatus.ERROR ||
					trainingJobStatus == TrainJobStatus.CANCELLED) &&
				trainingJobIntervalID
			) {
				fetchModel();
				clearInterval(trainingJobIntervalID);
				setTrainingJobIntervalID(undefined);
			}
		}, [trainingJob, trainingJobIntervalID]);

		useEffect(() => {
			if (trainingJob.extra_data?.history) {
				const tempAccuracySeries: ApexChartSeriesItem[] = [
					{
						name: 'accuracy',
						data: trainingJob.extra_data.history.accuracy.map(roundPercentage),
					},
					{
						name: 'val_accuracy',
						data: trainingJob.extra_data.history.val_accuracy.map(roundPercentage),
					},
				];

				const tempLossSeries: ApexChartSeriesItem[] = [
					{
						name: 'loss',
						data: trainingJob.extra_data.history.loss.map(roundNumber),
					},
					{
						name: 'val_loss',
						data: trainingJob.extra_data.history.val_loss.map(roundNumber),
					},
				];

				setAccuracySeries(tempAccuracySeries);
				setLossSeries(tempLossSeries);
			}
		}, [trainingJob.extra_data?.history]);

		const getProgressBarType = () => {
			if (trainingJob.extra_data?.status) {
				switch (trainingJob.extra_data.status) {
					case TrainJobStatus.TRAINED:
					case TrainJobStatus.EVALUATED:
						return <Progress value={100} size='xs' colorScheme='thia.purple' />;
					case TrainJobStatus.STARTING_TRAINING:
						return <Progress size='xs' colorScheme='green' isIndeterminate />;
					case TrainJobStatus.TRAINING:
						if (trainingJob.extra_data.batch_progress && trainingJob.extra_data.batches_per_epoch) {
							return (
								<Progress
									size='xs'
									value={trainingJob.extra_data.batch_progress}
									max={trainingJob.extra_data.batches_per_epoch}
									colorScheme='green'
								/>
							);
						}
						return <Progress size='xs' colorScheme='green' isIndeterminate />;

					case TrainJobStatus.EVALUATING:
						return <Progress size='xs' colorScheme='orange' isIndeterminate />;
					case TrainJobStatus.ERROR:
					case TrainJobStatus.CANCELLED:
						return <Progress value={100} size='xs' colorScheme='red' />;
					default:
						return <Progress size='xs' isIndeterminate />;
				}
			}

			return <Progress size='xs' isIndeterminate />;
		};

		const getTrainingText = (): string => {
			if (trainingJob.extra_data?.status) {
				switch (trainingJob.extra_data.status) {
					case TrainJobStatus.EVALUATING:
					case TrainJobStatus.EVALUATED:
					case TrainJobStatus.STARTING_TRAINING:
					case TrainJobStatus.TRAINING:
					case TrainJobStatus.TRAINED:
						if (trainingJob.extra_data.batch_size) {
							return `Epochs: ${trainingJob.extra_data.history?.accuracy.length ?? 0} Batch Size: ${
								trainingJob.extra_data.batch_size
							}`;
						}
						return `Epochs: ${trainingJob.extra_data.history?.accuracy.length ?? 0}`;
					default:
						return '';
				}
			}
			return '';
		};

		const renderEvaluation = () => {
			if (
				trainingJob.extra_data?.evaluation_result &&
				trainingJob.extra_data.status == TrainJobStatus.EVALUATED
			) {
				return (
					<Box
						w={isLargerThan1280 ? '90%' : 'full'}
						py='6'
						willChange='width'
						transition='width 200ms'
						alignSelf='center'
						px='8'
						rounded='lg'
						bg={sectionBG}
						borderWidth='1px'
						borderColor={borderColor}
						shadow='lg'>
						<Box>
							<Text as='h3' fontWeight='bold' fontSize='lg'>
								Evaluation
							</Text>
							<Text color={sectionTextColor} fontSize='sm'>
								The results of evaluating your model.
							</Text>
						</Box>
						<Wrap
							mt='4'
							spacing='8'
							shouldWrapChildren
							justify='space-evenly'
							direction={{ base: 'column', md: 'row' }}>
							<StatWithLearnMore
								label='AU PRC'
								statTitle='Area Under Precision Recall Curve'
								statDescription='Usually between 0.5-1.0, higher values inidicate a more accurate model.'
								value={roundNumber(trainingJob.extra_data.evaluation_result.prc)}
							/>
							<StatWithLearnMore
								label='Accuracy'
								statTitle='Accuracy'
								statDescription='Percentage of predictions that were correct.'
								percentage
								value={roundPercentage(trainingJob.extra_data.evaluation_result.accuracy)}
							/>

							<StatWithLearnMore
								label='Precision'
								statTitle='Precision'
								statDescription='Percentage of positive predictions that were correct.'
								percentage
								value={roundPercentage(trainingJob.extra_data.evaluation_result.precision)}
							/>
							<StatWithLearnMore
								label='Recall'
								statTitle='Recall'
								statDescription='Percentage of total relevant predictions. Also known as "true positive rate".'
								percentage
								value={roundPercentage(trainingJob.extra_data.evaluation_result.recall)}
							/>
							<StatWithLearnMore
								label='Log Loss'
								statTitle='Log Loss'
								statDescription='Cross-entropy between predictions and true value. Log loss is between 0-infinity, lower values indicates a more accurate model.'
								value={roundNumber(trainingJob.extra_data.evaluation_result.loss)}
							/>
						</Wrap>
					</Box>
				);
			}
		};
		const render = () => {
			return (
				<>
					<CancelTraining
						dialogOpen={isCancelTrainingDialogOpen}
						onClose={closeCancelTrainingDialog}
						cancelTraining={cancelTraining}
						isTrainingBeingCancelled={isTrainingCancelling}
					/>
					<Box
						w={isLargerThan1280 ? '90%' : 'full'}
						py='6'
						willChange='width'
						transition='width 200ms'
						alignSelf='center'
						px='8'
						rounded='lg'
						bg={sectionBG}
						borderWidth='1px'
						borderColor={borderColor}
						shadow='lg'>
						<HStack mb='8' w='full'>
							<Box>
								<Text as='h3' fontWeight='bold' fontSize='lg'>
									Training Job
								</Text>
								<Text color={sectionTextColor} fontSize='sm'>
									The latest training job.
								</Text>
							</Box>
							<Spacer />
							<VStack alignItems='flex-end'>
								<IconButton
									aria-label='Cancel Training'
									title='Cancel Training'
									icon={<ImCancelCircle />}
									variant='ghost'
									colorScheme='thia.gray'
									isDisabled={
										trainingJob.extra_data?.status !== TrainJobStatus.TRAINING &&
										trainingJob.extra_data?.status !== TrainJobStatus.STARTING_TRAINING
									}
									onClick={openCancelTrainingDialog}
								/>
								<InteractiveCopyBadge
									badgeID={trainJobID}
									fontSize='0.825rem'
									hoverLabel='Copy Training Job ID'
								/>
							</VStack>
						</HStack>
						<Box
							bg={evaluationCardBG}
							px='2'
							py='3'
							borderRadius='sm'
							shadow='md'
							borderWidth='1px'
							borderColor={borderColor}
							w='full'>
							<VStack spacing='1' w='full'>
								<HStack w='full' alignItems='baseline'>
									<Skeleton isLoaded={isInitialDataLoaded} maxW='60%' w='80px'>
										<Badge variant='outline' fontSize='md' colorScheme={statusColor()}>
											<Text noOfLines={1}>{trainingJob.extra_data?.status}</Text>
										</Badge>
									</Skeleton>

									<Spacer />
									<Skeleton isLoaded={isInitialDataLoaded}>
										<Text
											fontSize='0.9rem'
											pr='1.5'
											fontFamily='mono'
											color={trainingJobProgressTextColor}>
											{getTrainingText()}
										</Text>
									</Skeleton>
								</HStack>
								<SkeletonText
									isLoaded={isInitialDataLoaded}
									alignSelf='flex-start'
									pt='6'
									maxW='full'
									w='full'
									noOfLines={1}>
									<Text
										fontFamily='mono'
										fontSize='0.8rem'
										pl='1.5'
										color={trainingJobProgressTextColor}
										noOfLines={1}>
										{trainingJob.extra_data?.status_description}
									</Text>
								</SkeletonText>

								<Skeleton isLoaded={isInitialDataLoaded} w='full' pt='1'>
									{getProgressBarType()}
								</Skeleton>
							</VStack>
						</Box>
						<Flex w='full' justify='center' mt='6' wrap='wrap'>
							<Box flex='1 1 auto' minW='350px'>
								<ChakraReactApexChart
									type='area'
									height={350}
									series={accuracySeries}
									options={accuracyApexChartOptions}
								/>
							</Box>
							<Box flex='1 1 auto' minW='350px'>
								<ChakraReactApexChart
									type='area'
									series={lossSeries}
									height={350}
									options={lossApexChartOptions}
								/>
							</Box>
						</Flex>
					</Box>
					{renderEvaluation()}
				</>
			);
		};

		return render();
	}),
);

ActiveTrainJob.displayName = 'ActiveTrainJob';
