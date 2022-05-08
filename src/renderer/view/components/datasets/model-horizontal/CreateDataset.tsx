import React, { ChangeEvent, useState } from 'react';
import {
	Flex,
	Modal,
	ModalBody,
	ModalCloseButton,
	ModalContent,
	ModalHeader,
	ModalOverlay,
	Text,
	VStack,
	Input,
	Button,
	useToast,
} from '@chakra-ui/react';
import { connect } from 'react-redux';

import { EngineRequestHandler } from '_/renderer/engine-requests/engineRequestHandler';
import { IMAGE_CLASSIFICATION } from '_view_helpers/constants/modelConstants';
import { waitTillEngineJobComplete } from '_/renderer/view/helpers/functionHelpers';
import { refreshDatasetListAction } from '_/renderer/state/dataset-list/DatasetListActions';

interface Props {
	onClose: () => void;
	isOpen: boolean;
	refreshDataset: () => void;
}

const CreateDatasetC = React.memo(({ onClose, isOpen, refreshDataset }: Props) => {
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
		const [createDatasetErr, createDatasetRes] = await EngineRequestHandler.getInstance().createDataset({
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

		// Complete! Send a notification to user
		setDatasetCreating(false);
		toast({
			title: 'Success',
			description: 'Dataset Created Successfully',
			status: 'success',
			duration: 1500,
			isClosable: false,
		});
		onClose();
		refreshDataset();
	};
	return (
		<Modal
			isOpen={isOpen}
			onClose={() => {
				setDatasetName('');
				onClose();
			}}
			isCentered
			blockScrollOnMount
			motionPreset='slideInBottom'
			scrollBehavior='inside'>
			<ModalOverlay />
			<ModalContent>
				<ModalHeader>Create Dataset</ModalHeader>
				<ModalCloseButton size='sm' />
				<ModalBody pb='4'>
					<VStack spacing='2' alignItems='flex-start'>
						<Text fontWeight='semibold' color='gray.300' as='h4' fontSize='sm' pl='1' mb='1'>
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
							<Button isLoading={datasetCreating} onClick={createDataset} colorScheme='teal'>
								Create
							</Button>
						</Flex>
					</VStack>
				</ModalBody>
			</ModalContent>
		</Modal>
	);
});

CreateDatasetC.displayName = 'CreateDataset';

/**
 * Modal that opens when creating a new dataset.
 */
export const CreateDataset = connect(null, {
	refreshDataset: refreshDatasetListAction,
})(CreateDatasetC);
