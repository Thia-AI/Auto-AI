import React, { ChangeEvent, useState } from 'react';
import {
	Box,
	Flex,
	Modal,
	ModalBody,
	ModalCloseButton,
	ModalContent,
	ModalHeader,
	ModalOverlay,
	useMediaQuery,
	Text,
	VStack,
	Input,
	HStack,
	Button,
	Spacer,
	useToast,
} from '@chakra-ui/react';
import { connect } from 'react-redux';
import { push, Push } from 'connected-react-router';

import { EngineActionHandler } from '_engine_requests/engineActionHandler';
import { IMAGE_CLASSIFICATION } from '_view_helpers/constants/modelConstants';
import { waitTillEngineJobComplete } from '_/renderer/view/helpers/engineJobHelper';

interface Props {
	onClose: () => void;
	isOpen: boolean;
	push: Push;
}

const CreateDatasetC = React.memo((props: Props) => {
	// Toast
	const toast = useToast();
	// Dataset creation status
	const [datasetCreating, setDatasetCreating] = useState(false);
	const [datasetName, setDatasetName] = useState('');

	const handleDatasetNameChange = (event: ChangeEvent<HTMLInputElement>) => {
		const name = event.target.value;
		setDatasetName(name);
		// TODO: Add validation
	};
	// TODO: Add input validation as in ICModelContent:createModel
	const createDataset = async () => {
		setDatasetCreating(true);
		const [createDatasetErr, createDatasetRes] =
			await EngineActionHandler.getInstance().createDataset({
				name: datasetName,
				type: IMAGE_CLASSIFICATION[0],
			});

		if (createDatasetErr) {
			toast({
				title: 'Error',
				description: `${createDatasetRes['Error']}`,
				status: 'error',
				duration: 1500,
				isClosable: false,
			});
			setDatasetCreating(false);
			return;
		}

		// Wait until the creation job has completed
		await waitTillEngineJobComplete(createDatasetRes['ids'][0]);
		const [_, datasetData] = await EngineActionHandler.getInstance().getDatasetByName(
			datasetName,
		);
		// Complete! Send a notification to user
		setDatasetCreating(false);
		toast({
			title: 'Success',
			description: 'Dataset Created Successfully',
			status: 'success',
			duration: 1500,
			isClosable: false,
		});
		props.onClose();
		props.push(`/dataset/${datasetData['id']}`);
	};
	return (
		<Modal
			isOpen={props.isOpen}
			onClose={props.onClose}
			isCentered
			blockScrollOnMount={true}
			motionPreset='slideInBottom'
			scrollBehavior='inside'>
			<ModalOverlay />
			<ModalContent>
				<ModalHeader>Create Dataset</ModalHeader>
				<ModalCloseButton />
				<ModalBody pb='4'>
					<VStack spacing='2' alignItems='flex-start'>
						<Text
							fontWeight='semibold'
							color='gray.300'
							as='h4'
							fontSize='sm'
							pl='1'
							mb='1'>
							Name
						</Text>
						<Flex justifyContent='space-between' w='full'>
							<Input
								value={datasetName}
								onChange={handleDatasetNameChange}
								w='fit-content'
								variant='filled'
								placeholder="Enter the dataset's name"
							/>
							<Button
								isLoading={datasetCreating}
								onClick={createDataset}
								colorScheme='teal'>
								Create
							</Button>
						</Flex>
					</VStack>
				</ModalBody>
			</ModalContent>
		</Modal>
	);
});

export const CreateDataset = connect(null, {
	push,
})(CreateDatasetC);
