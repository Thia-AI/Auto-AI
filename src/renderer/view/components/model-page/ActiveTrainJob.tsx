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
} from '@chakra-ui/react';
import React, { useCallback, useEffect, useState } from 'react';
import { connect } from 'react-redux';
import isValidHTMLProp from '@emotion/is-prop-valid';

import { EngineActionHandler } from '_/renderer/engine-requests/engineActionHandler';
import ReactApexChart from 'react-apexcharts';
import { ApexOptions } from 'apexcharts';
import { nullTrainJob, TrainJob, TrainJobStatus } from '../../helpers/constants/engineDBTypes';
import { InteractiveCopyBadge } from '../interactive/InteractiveCopyBadge';
import { argmin } from '../../helpers/functionHelpers';
import { SimpleStat } from '../stats/SimpleStat';

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

const ActiveTrainJobC = React.memo(({ trainJobID, fetchModel }: Props) => {
	const trainingJobIntervalRetrievalTimeMS = 2_000;
	const [trainingJob, setTrainingJob] = useState<TrainJob>(nullTrainJob);
	const [trainingJobIntervalID, setTrainingJobIntervalID] = useState<number>();
	const [isInitialDataLoaded, setIsInitialDataLoaded] = useState(false);
	const [isLargerThan1280] = useMediaQuery('(min-width: 1280px)');
	const [accuracySeries, setAccuracySeries] = useState<ApexChartSeriesItem[]>([]);
	const [lossSeries, setLossSeries] = useState<ApexChartSeriesItem[]>([]);

	const sectionBG = mode('white', 'gray.700');
	// purple.600
	const trainingGraphBestPointBGColor = mode('white', '#6B46C1');
	const trainingGraphBestPointMarkerStrokeColor = mode('white', '#805AD5');

	const roundPercentage = (element: number) => {
		return Number((element * 100).toFixed(2));
	};

	const roundNumber = (element: number) => {
		return Number(element.toFixed(4));
	};

	const baseApexChartOptions: ApexOptions = {
		theme: {
			mode: 'dark',
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
						strokeColor: trainingGraphBestPointMarkerStrokeColor,
						fillColor: trainingGraphBestPointBGColor,
					},
					label: {
						borderColor: '#FF4560',
						borderWidth: 0,
						borderRadius: 1,
						text: 'BEST',
						offsetY: 5,
						style: {
							background: trainingGraphBestPointBGColor,
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
						strokeColor: trainingGraphBestPointMarkerStrokeColor,
						fillColor: trainingGraphBestPointBGColor,
					},
					label: {
						borderColor: '#FF4560',
						borderWidth: 0,
						borderRadius: 1,
						text: 'BEST',
						offsetY: 5,
						style: {
							background: trainingGraphBestPointBGColor,
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
					return 'purple';
				case TrainJobStatus.TRAINING:
				case TrainJobStatus.STARTING_TRAINING:
					return 'green';
				case TrainJobStatus.EVALUATING:
					return 'orange';
				case TrainJobStatus.ERROR:
					return 'red';
				default:
					return 'gray';
			}
		}
		return 'gray';
	};

	const getTrainingJob = useCallback(async () => {
		const [error, resData] = await EngineActionHandler.getInstance().getTrainJob(trainJobID);
		if (!error) {
			setTrainingJob(resData);
			// Set data loaded if it is the first time
			if (!isInitialDataLoaded) {
				setIsInitialDataLoaded(true);
			}
		}
	}, [trainJobID, isInitialDataLoaded]);

	// Initialization
	useEffect(() => {
		// Get train job right away
		getTrainingJob();
		// Set interval
		const intervalID = window.setInterval(getTrainingJob, trainingJobIntervalRetrievalTimeMS);
		setTrainingJobIntervalID(intervalID);
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
		if (trainingJob.extra_data?.status == TrainJobStatus.EVALUATED && trainingJobIntervalID) {
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
					return <Progress value={100} size='xs' colorScheme='purple' />;
				case TrainJobStatus.TRAINING:
				case TrainJobStatus.STARTING_TRAINING:
					return <Progress size='xs' colorScheme='green' isIndeterminate />;
				case TrainJobStatus.EVALUATING:
					return <Progress size='xs' colorScheme='orange' isIndeterminate />;
				case TrainJobStatus.ERROR:
					return <Progress value={100} size='xs' colorScheme='red' />;
				default:
					return <Progress size='xs' isIndeterminate />;
			}
		}

		return <Progress size='xs' isIndeterminate />;
	};

	const getEpochsText = (): string => {
		if (trainingJob.extra_data?.status) {
			switch (trainingJob.extra_data.status) {
				case TrainJobStatus.EVALUATING:
				case TrainJobStatus.EVALUATED:
				case TrainJobStatus.STARTING_TRAINING:
				case TrainJobStatus.TRAINING:
				case TrainJobStatus.TRAINED:
					return `Epochs: ${trainingJob.extra_data.history?.accuracy.length ?? 0}`;
				default:
					return '';
			}
		}
		return '';
	};

	const renderEvaluation = () => {
		if (trainingJob.extra_data?.evaluation_result && trainingJob.extra_data.status == TrainJobStatus.EVALUATED) {
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
					shadow='base'>
					<Box>
						<Text as='h3' fontWeight='bold' fontSize='lg'>
							Evaluation
						</Text>
						<Text color='gray.500' fontSize='sm'>
							The results of evaluating your model.
						</Text>
					</Box>
					<Wrap
						mt='4'
						spacing='8'
						shouldWrapChildren
						justify='space-evenly'
						direction={{ base: 'column', md: 'row' }}>
						<SimpleStat label='AUC ROC' value={roundNumber(trainingJob.extra_data.evaluation_result.auc)} />
						<SimpleStat
							label='Accuracy'
							percentage
							value={roundPercentage(trainingJob.extra_data.evaluation_result.accuracy)}
						/>

						<SimpleStat
							label='Precision'
							percentage
							value={roundPercentage(trainingJob.extra_data.evaluation_result.precision)}
						/>
						<SimpleStat
							label='Recall'
							percentage
							value={roundPercentage(trainingJob.extra_data.evaluation_result.recall)}
						/>
						<SimpleStat
							label='Log Loss'
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
				<Box
					w={isLargerThan1280 ? '90%' : 'full'}
					py='6'
					willChange='width'
					transition='width 200ms'
					alignSelf='center'
					px='8'
					rounded='lg'
					bg={sectionBG}
					shadow='base'>
					<HStack mb='8' w='full'>
						<Box>
							<Text as='h3' fontWeight='bold' fontSize='lg'>
								Training Job
							</Text>
							<Text color='gray.500' fontSize='sm'>
								The latest training job.
							</Text>
						</Box>
						<Spacer />
						<InteractiveCopyBadge
							badgeID={trainJobID}
							fontSize='0.825rem'
							hoverLabel='Copy Training Job ID'
						/>
					</HStack>
					<Box bg='gray.750' px='2' py='3' borderRadius='sm' w='full'>
						<VStack spacing='1' w='full'>
							<HStack w='full' alignItems='baseline'>
								<Skeleton isLoaded={isInitialDataLoaded} maxW='60%' w='80px'>
									<Badge variant='outline' fontSize='md' colorScheme={statusColor()}>
										<Text isTruncated>{trainingJob.extra_data?.status}</Text>
									</Badge>
								</Skeleton>

								<Spacer />
								<Skeleton isLoaded={isInitialDataLoaded}>
									<Text fontSize='0.9rem' pr='1.5' fontFamily='mono' color='gray.500'>
										{getEpochsText()}
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
								<Text fontFamily='mono' fontSize='0.8rem' pl='1.5' color='gray.600' isTruncated>
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
});

ActiveTrainJobC.displayName = 'ActiveTrainJob';

/**
 * Component that renders the UI in a model page when a train job ID is present.
 * Renders training status and evaluation metrics.
 */
export const ActiveTrainJob = connect()(ActiveTrainJobC);