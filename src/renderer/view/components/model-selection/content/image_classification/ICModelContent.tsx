import React, { useState, ChangeEvent } from 'react';
import {
	Box,
	VStack,
	Text,
	Input,
	Center,
	Button,
	HStack,
	useRadioGroup,
	useToast,
	FormControl,
	FormLabel,
	FormErrorMessage,
	Heading,
	Wrap,
	Link,
} from '@chakra-ui/react';
import { connect } from 'react-redux';
import { push, Push } from 'connected-react-router';

import { openCloseModelSelectionAction } from '_/renderer/state/choose-model/ChooseModelActions';
import { IOpenCloseModelSelectionAction } from '_/renderer/state/choose-model/model/actionTypes';

import { ICModelRadioCard } from './ICModelRadio';
import { waitTillEngineJobComplete } from '_/renderer/view/helpers/functionHelpers';
import { changeSelectedPage } from '_state/side-menu/SideModelAction';
import { IChangeSelectedPageAction } from '_/renderer/state/side-menu/model/actionTypes';
import { MODELS_PAGE } from '_view_helpers/constants/pageConstants';
import { EngineRequestHandler } from '_/renderer/engine-requests/engineRequestHandler';

interface Props {
	openCloseModelSelectionAction: () => IOpenCloseModelSelectionAction;
	push: Push;
	changeSelectedPage: (pageNumber: number) => IChangeSelectedPageAction;
}

const ICModelContentC = React.memo((props: Props) => {
	// Toast
	const toast = useToast();
	// Model Name
	const [modelNameValue, setModelNameValue] = useState('');
	const [modelNameValid, setModelNameValid] = useState(false);
	const INITIAL_MODEL_NAME_ERROR = 'Enter a name for your model.';
	const [modelNameError, setModelNameError] = useState(INITIAL_MODEL_NAME_ERROR);

	// Model Creation Status
	const [modelCreating, setModelCreating] = useState(false);
	const [modelNameInputFocusedOnce, setModelNameInputFocusedOnce] = useState(false);

	// Errors
	const validList = [[modelNameValid, modelNameError]];

	// Radio Cards
	const radioOptions = ['Fast', 'Balanced', 'Precise'];
	const radioOptionDescriptions = [
		'A model that is more focused on being smaller and faster at the cost of being less accurate.',
		'A model that is both relatively fast and fairly accurate.',
		"A model that is more focused on it's accuracy at the cost of being slower and larger",
	];
	const [modelTypeValue, setModelTypeValue] = useState(radioOptions[1]);

	const { getRootProps, getRadioProps } = useRadioGroup({
		name: 'framework',
		defaultValue: modelTypeValue,
		onChange: (nextValue: string) => {
			setModelTypeValue(nextValue);
		},
	});

	const group = getRootProps();

	const handleModelNameChange = (event: ChangeEvent<HTMLInputElement>) => {
		const name = event.target.value;
		setModelNameValue(name);

		// validate
		if (name.length === 0) {
			setModelNameError(INITIAL_MODEL_NAME_ERROR);
			setModelNameValid(false);
			return;
		}
		const regex = /^[a-zA-Z0-9-_]+$/;
		if (name.search(regex) === -1) {
			setModelNameError('Alphanumeric characters only');
			setModelNameValid(false);
			return;
		}
		setModelNameValid(true);
		setModelNameError('');
	};

	const createModel = async () => {
		// check errors
		let wasError = false;
		validList.forEach((validPair) => {
			const inputValid = validPair[0];
			const inputError = validPair[1];
			if (!inputValid) {
				wasError = true;
				toast({
					title: 'Error',
					description: `${inputError}`,
					status: 'error',
					duration: 1500,
					isClosable: true,
				});
			}
		});
		if (wasError) return;
		// No error, send create model action
		setModelCreating(true);
		const [createModelErr, createModelRes] = await EngineRequestHandler.getInstance().createModel({
			model_name: modelNameValue,
			model_type: 'image_classification',
			model_type_extra: modelTypeValue.toLowerCase(),
		});
		// If error occurred when sending the Engine Action
		if (createModelErr) {
			toast({
				title: 'Error',
				description: `${createModelRes['Error']}`,
				status: 'error',
				duration: 1500,
				isClosable: false,
			});
			setModelCreating(false);
			return;
		}
		// Wait until the creation job has completed
		await waitTillEngineJobComplete(createModelRes['ids'][0]);
		// Complete! Send a notification to user
		setModelCreating(false);
		toast({
			title: 'Success',
			description: 'Model Created Successfully',
			status: 'success',
			duration: 1500,
			isClosable: false,
		});
		// Close model selection modal and navigate to models page
		props.openCloseModelSelectionAction();
		props.changeSelectedPage(MODELS_PAGE);
		props.push('/models');
	};
	return (
		<VStack spacing='5'>
			<VStack w='full' alignItems='flex-start'>
				<Text fontSize='15px'>
					Image classification is the task of one (single-label classification) or more (multi-label
					classification) labels to a given image. Thia trains a deep learning model on the images and labels
					in your dataset.
				</Text>
				<Text fontSize='15px'>
					For example, you could train a model that classifies different types of fashion clothing to
					automatically label user&#39;s clothes in your e-commerce website. Or you could use it to
					automatically detect intruders from your CCTV footage, identify objects from satellite images,
					automatically perform visual inspection and quality control of assembly lines - suffice to say, list
					is endless.
				</Text>
				<Text fontSize='15px'>
					Instead of developing the expertise of deep learning, which is undergoing rapid improvements each
					day, let Thia handle it.
				</Text>
				{/* // TODO: Change this URL to a prop that redirects to thia documentation for that specific model type */}
				<Link fontSize='sm' href='https://google.ca'>
					Learn more
				</Link>
			</VStack>
			<Heading as='h4' size='md' alignSelf='flex-start'>
				Model Details
			</Heading>
			<Box w='full' px='2' pt='1'>
				<FormControl variant='floating' isRequired isInvalid={modelNameInputFocusedOnce && !modelNameValid}>
					<Input
						onChange={handleModelNameChange}
						onBlur={() => setModelNameInputFocusedOnce(true)}
						value={modelNameValue}
						placeholder=' '
						type='email'
					/>
					<FormLabel bg='var(--chakra-colors-gray-800) !important'>Model Name</FormLabel>
					<FormErrorMessage>{modelNameError}</FormErrorMessage>
				</FormControl>
			</Box>
			<Heading as='h4' size='md' alignSelf='flex-start' pt='3'>
				Model Type
			</Heading>
			<Box w='full' px='2' pt='1'>
				<Wrap
					{...group}
					shouldWrapChildren
					justify='space-evenly'
					spacing='4'
					w='full'
					direction={{ base: 'column', md: 'row' }}>
					{radioOptions.map((value, i) => {
						const radio = getRadioProps({ value });
						return (
							<ICModelRadioCard key={value} {...radio} description={radioOptionDescriptions[i]}>
								{value}
							</ICModelRadioCard>
						);
					})}
				</Wrap>
			</Box>

			<Center pt='8'>
				<HStack spacing='3'>
					<Button isLoading={modelCreating} loadingText='Creating' colorScheme='teal' onClick={createModel}>
						Create
					</Button>
					<Button colorScheme='red' variant='ghost' onClick={props.openCloseModelSelectionAction}>
						Cancel
					</Button>
				</HStack>
			</Center>
		</VStack>
	);
});

ICModelContentC.displayName = 'ICModelContent';

/**
 * Image classification model content description.
 */
export const ICModelContent = connect(null, {
	openCloseModelSelectionAction,
	push,
	changeSelectedPage,
})(ICModelContentC);
