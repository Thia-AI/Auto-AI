import React, { useState, ChangeEvent } from 'react';
import {
	Box,
	VStack,
	Flex,
	Text,
	Input,
	Badge,
	useColorModeValue,
	Center,
	Button,
	HStack,
	SlideFade,
	useRadioGroup,
	useToast,
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
import { EngineActionHandler } from '_engine_requests/engineActionHandler';

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
	const [modelNameError, setModelNameError] = useState('Enter A Name');

	// Model Creation Status
	const [modelCreating, setModelCreating] = useState(false);

	// Errors
	const validList = [[modelNameValid, modelNameError]];

	// Dark/Light mode colors
	const inputColor = useColorModeValue('gray.700', 'gray.300');

	// Radio Cards
	const radioOptions = ['Balanced', 'Performance', 'Accuracy'];
	const [modelTypeValue, setModelTypeValue] = React.useState(radioOptions[0]);

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
			setModelNameError('Enter A Name');
			setModelNameValid(false);
			return;
		}
		const regex = /^[a-zA-Z0-9-_]+$/;
		if (name.search(regex) === -1) {
			setModelNameError('Alphanumeric Characters Only');
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
		const [createModelErr, createModelRes] = await EngineActionHandler.getInstance().createModel({
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
		<VStack spacing='2'>
			<Center h='125px'>
				<Text as='h1' fontSize='4xl'>
					Description [To Be Added]
				</Text>
			</Center>
			<Flex direction='row' w='full'>
				<Box>
					<Text fontWeight='semibold' color={inputColor} as='h4' fontSize='sm' pl='1' mb='1'>
						Name
					</Text>
					<Input
						isInvalid={!modelNameValid}
						onChange={handleModelNameChange}
						value={modelNameValue}
						variant='filled'
						placeholder="Enter the model's name"
					/>
					<SlideFade offsetY='10px' in={!modelNameValid}>
						<Badge colorScheme='red'>{modelNameError}</Badge>
					</SlideFade>
				</Box>
			</Flex>
			<Flex direction='row' w='full' pt='4'>
				<Box w='full'>
					<Text fontWeight='semibold' color={inputColor} as='h4' fontSize='sm' pl='1' mb='1'>
						Model Type:
					</Text>
					<VStack {...group} alignItems='flex-start' w='full'>
						{radioOptions.map((value) => {
							const radio = getRadioProps({ value });
							return (
								<ICModelRadioCard key={value} {...radio}>
									{value}
								</ICModelRadioCard>
							);
						})}
					</VStack>
				</Box>
			</Flex>

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
