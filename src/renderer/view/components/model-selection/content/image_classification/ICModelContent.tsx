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

import { openCloseModelSelectionAction } from '_/renderer/state/choose-model/ChooseModelActions';
import { IOpenCloseModelSelectionAction } from '_/renderer/state/choose-model/model/actionTypes';

import { RadioCard } from './ICModelRadio';
import { ipcRenderer } from 'electron';

interface Props {
	openCloseModelSelectionAction: () => IOpenCloseModelSelectionAction;
}

const ICModelContentC = (props: Props) => {
	// Toast
	const toast = useToast();
	// Model Name
	const [modelNameValue, setModelNameValue] = useState('');
	const [modelNameValid, setModelNameValid] = useState(false);
	const [modelNameError, setModelNameError] = useState('Enter A Name');

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
		} else setModelNameValid(true);
	};

	// eslint-disable-next-line  @typescript-eslint/no-unused-vars
	const createModel = async (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
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
		const [errorExists, res] = await ipcRenderer.invoke('engine-action:createModel', {
			model_name: modelNameValue,
			model_type: 'image_classification',
			model_type_extra: modelTypeValue.toLowerCase(),
		});
		if (errorExists) {
			toast({
				title: 'Error',
				description: `${res['Error']}`,
				status: 'error',
				duration: 1500,
				isClosable: false,
			});
			return;
		}
		toast({
			title: 'Success',
			description: `Model [${res['ids'][0]}] Created Successfully`,
			status: 'success',
			duration: 1500,
			isClosable: false,
		});
		props.openCloseModelSelectionAction();
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
					<Text color={inputColor} as='h4' fontSize='sm' pl='1' mb='1'>
						Name:
					</Text>
					<Input
						isInvalid={!modelNameValid}
						onChange={handleModelNameChange}
						value={modelNameValue}
						variant='filled'
						placeholder="Enter your model's name"
					/>
					<SlideFade offsetY='10px' in={!modelNameValid}>
						<Badge colorScheme='red'>{modelNameError}</Badge>
					</SlideFade>
				</Box>
			</Flex>
			<Flex direction='row' w='full' pt='4'>
				<Box w='full'>
					<Text color={inputColor} as='h4' fontSize='sm' pl='1' mb='1'>
						Model Type:
					</Text>
					<VStack {...group} alignItems='flex-start' w='full'>
						{radioOptions.map((value) => {
							const radio = getRadioProps({ value });
							return (
								<RadioCard key={value} {...radio}>
									{value}
								</RadioCard>
							);
						})}
					</VStack>
				</Box>
			</Flex>

			<Center pt='8'>
				<HStack spacing='3'>
					<Button colorScheme='teal' onClick={createModel}>
						Create
					</Button>
					<Button
						colorScheme='red'
						variant='ghost'
						onClick={props.openCloseModelSelectionAction}>
						Cancel
					</Button>
				</HStack>
			</Center>
		</VStack>
	);
};
const mapStateToProps = () => ({});
export const ICModelContent = connect(mapStateToProps, {
	openCloseModelSelectionAction,
})(ICModelContentC);
