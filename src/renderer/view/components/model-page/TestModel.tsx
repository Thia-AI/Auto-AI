import React, { useCallback, useEffect, useState } from 'react';
import {
	Box,
	useColorModeValue as mode,
	useMediaQuery,
	chakra,
	Text,
	Center,
	HStack,
	VStack,
	Button,
	Wrap,
} from '@chakra-ui/react';
import { useDropzone, FileRejection, ErrorCode } from 'react-dropzone';

import { Model, TestJob } from '../../helpers/constants/engineTypes';
import { TestModelImagePreview } from './TestModelImagePreview';
import { EngineRequestHandler } from '_/renderer/engine-requests/engineRequestHandler';
import { toast, waitTillEngineJobComplete } from '../../helpers/functionHelpers';
import { useUser } from 'reactfire';

interface Props {
	model: Model;
}

interface FileWithPreview extends File {
	preview?: string;
}

/**
 * Component for testing a trained model.
 */
export const TestModel = React.memo(({ model }: Props) => {
	const MAX_NUM_FILES = 10;

	const [selectedFiles, setSelectedFiles] = useState<FileWithPreview[]>([]);
	const [rejectedFiles, setRejectedFiles] = useState<FileRejection[]>([]);
	const [testJobPredictions, setTestJobPredictions] = useState<string[]>([]);
	const [testJobID, setTestJobID] = useState<string | null>(null);
	const [testRunning, setTestRunning] = useState(false);

	const [isLargerThan1280] = useMediaQuery('(min-width: 1280px)');
	const inputColor = mode('thia.gray.700', 'thia.gray.500');
	const borderColor = mode('thia.gray.200', 'thia.gray.600');
	const cardBG = mode('thia.gray.50', 'thia.gray.700');

	const { data: user } = useUser();

	const onDrop = useCallback((acceptedFiles: File[], rejected: FileRejection[]) => {
		// Do something with the files
		setSelectedFiles(
			acceptedFiles.map((file) =>
				Object.assign(file, {
					preview: URL.createObjectURL(file),
				}),
			),
		);
		setRejectedFiles(rejected);
	}, []);

	const { getRootProps, getInputProps, isDragActive, isDragReject, draggedFiles } = useDropzone({
		onDrop,
		accept: ['image/jpeg', 'image/png'],
		multiple: true,
		maxFiles: MAX_NUM_FILES,
	});

	const cancelJob = async (jobID: string | null) => {
		if (jobID && user) {
			const [cancelJobError, cancelJobResData] = await EngineRequestHandler.getInstance().cancelJob(jobID);
			if (!cancelJobError && cancelJobResData['job_found']) {
				if (cancelJobResData['job_cancelled_successfully']) {
					// Job cancelled successfully
					toast({
						title: 'Test Job Cancelled',
						description: `Test job for '${model.model_name}' model cancelled due to page exit`,
						status: 'info',
						duration: 1500,
						isClosable: false,
						uid: user.uid,
					});
				} else {
					// Job failed to cancel
					toast({
						title: 'Test Job Cancellation Failed',
						description: `Failed to cancel test job for '${model.model_name}' model`,
						status: 'error',
						duration: 1500,
						isClosable: false,
						uid: user.uid,
					});
				}
			}
		}
	};

	useEffect(() => {
		if (rejectedFiles.length > 0 && user) {
			if (rejectedFiles[0].errors[0].code == ErrorCode.FileInvalidType) {
				// Invalid file type
				toast({
					title: 'Error',
					description: 'Can only select an image',
					status: 'error',
					duration: 1500,
					isClosable: false,
					uid: user.uid,
					saveToStore: false,
				});
			} else if (rejectedFiles[0].errors[0].code == ErrorCode.TooManyFiles) {
				// Too many files selected
				toast({
					title: 'Error',
					description: `Cannot select more than ${MAX_NUM_FILES} images`,
					status: 'error',
					duration: 1500,
					isClosable: false,
					uid: user.uid,
					saveToStore: false,
				});
			}
			// Reset
			setRejectedFiles([]);
		}
	}, [rejectedFiles, user]);

	useEffect(() => {
		setSelectedFiles([]);
		setTestJobPredictions([]);
	}, []);

	useEffect(() => {
		return () => {
			cancelJob(testJobID);
		};
	}, [testJobID, user]);

	useEffect(() => {
		return () => {
			// Make sure to revoke the data uris to avoid memory leaks
			selectedFiles.forEach((file) => URL.revokeObjectURL(file.preview!));
		};
	}, [selectedFiles]);

	const testModel = async () => {
		if (!user) return;
		if (selectedFiles.length > 0) {
			setTestRunning(true);
			const formData = new FormData();
			for (let i = 0; i < selectedFiles.length; i++) {
				formData.append('files', selectedFiles[i]);
			}
			const idToken = await user.getIdToken();
			const [testModelError, testModelResData] = await EngineRequestHandler.getInstance().testModel(
				model.id,
				idToken,
				formData,
				{
					headers: {
						'Content-Type': 'multipart/form-data',
					},
				},
			);
			if (testModelError) {
				toast({
					title: 'Test model failed',
					description: testModelResData['Error'],
					status: 'error',
					duration: 1500,
					isClosable: false,
					uid: user.uid,
				});
				setTestRunning(false);
				return;
			}
			const testJobIDTemp: string = testModelResData['ids'][0];
			setTestJobID(testJobIDTemp);
			await waitTillEngineJobComplete(testJobIDTemp);
			const [requestErrorExists, jobResData] = await EngineRequestHandler.getInstance().getJob(testJobIDTemp);
			if (requestErrorExists) {
				toast({
					title: 'Failed to get predictions',
					description: jobResData['Error'],
					status: 'error',
					duration: 1500,
					isClosable: false,
					uid: user.uid,
				});
				setTestRunning(false);
				setTestJobID(null);
				return;
			}
			const jobResDataTestJob = jobResData as TestJob;

			if (jobResDataTestJob.extra_data?.error) {
				setTestRunning(false);
				setTestJobID(null);
				return;
			}
			// Since no error, predictions will be there.

			// eslint-disable-next-line @typescript-eslint/no-non-null-asserted-optional-chain
			setTestJobPredictions(jobResDataTestJob.extra_data?.predictions!);
			setTestRunning(false);
			setTestJobID(null);
		} else {
			// Need to have images to test
			toast({
				title: 'No images',
				description: 'Need to have images to test',
				status: 'error',
				duration: 1500,
				isClosable: false,
				uid: user.uid,
				saveToStore: false,
			});
		}
	};

	const renderDragText = () => {
		let text = 'Drop Images Or Click To Select';
		let error = false;
		if (isDragActive) {
			if (isDragReject && draggedFiles.length > MAX_NUM_FILES) {
				text = `Can Only Drag Up To ${MAX_NUM_FILES} Images`;
				error = true;
			} else {
				text = 'Drop Images Here...';
			}
		}
		return (
			<Text color={error ? 'red.400' : inputColor} opacity={error ? 0.8 : 1}>
				{text}
			</Text>
		);
	};

	const renderImagePreviews = () => {
		return (
			<Wrap
				mt='4'
				spacing='8'
				shouldWrapChildren
				justify='space-evenly'
				direction={{ base: 'column', md: 'row' }}>
				{selectedFiles.map((file, i) => {
					return (
						<TestModelImagePreview
							imageSRC={file.preview!}
							testedLabel={testJobPredictions[i] ?? undefined}
							key={i}
							trainedLabel={
								testJobPredictions[i] !== undefined
									? model.extra_data?.trained_model.labels_trained_on[testJobPredictions[i]]
									: undefined
							}
							testRunning={testRunning}
						/>
					);
				})}
			</Wrap>
		);
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
				<Box>
					<Text as='h3' fontWeight='bold' fontSize='lg'>
						Predict
					</Text>
					<Text color={mode('thia.gray.700', 'thia.gray.300')} fontSize='sm'>
						Test your model by predicting images on it.
					</Text>
				</Box>
				<HStack w='full' mt='4'>
					<Center
						flex='1 1 auto'
						willChange='border-color'
						py='8'
						_hover={{
							borderColor: 'thia.purple.400',
						}}
						cursor='pointer'
						border='2px dashed'
						borderRadius='md'
						transition='all 250ms ease'
						outline='none'
						borderColor={
							isDragReject && draggedFiles.length > MAX_NUM_FILES
								? 'red.400'
								: isDragActive
								? 'green.400'
								: inputColor
						}
						overflow='hidden'
						color={mode('thia.dark.700', 'thia.dark.500')}
						{...getRootProps()}>
						<chakra.input {...getInputProps()} disabled={testRunning} />
						{renderDragText()}
					</Center>
					<VStack pl='2'>
						<Button
							w='full'
							variant='ghost'
							colorScheme='thia.purple'
							onClick={testModel}
							isLoading={testRunning}
							loadingText='Running Test'>
							Test
						</Button>
						<Button
							w='full'
							variant='outline'
							colorScheme='thia.gray'
							onClick={() => {
								setSelectedFiles([]);
								setTestJobPredictions([]);
							}}
							isDisabled={testRunning}>
							Clear
						</Button>
					</VStack>
				</HStack>
				{renderImagePreviews()}
			</Box>
			{/* TODO: Fix router prompt not working. */}
			{/* <RouterPrompt
				when={testJobID !== null}
				title='Leave this page'
				okText='Confirm'
				cancelText='Cancel'
				bodyText='Test job is currently running. Are you sure you want to leave?'
			/> */}
		</>
	);
});

TestModel.displayName = 'TestModel';
