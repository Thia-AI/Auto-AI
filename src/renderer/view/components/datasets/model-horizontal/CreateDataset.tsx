import React, { ChangeEvent, useRef, useState } from 'react';
import {
	Text,
	VStack,
	Input,
	Button,
	AlertDialog,
	AlertDialogOverlay,
	AlertDialogContent,
	AlertDialogHeader,
	AlertDialogBody,
	AlertDialogFooter,
} from '@chakra-ui/react';
import { connect } from 'react-redux';

import { EngineRequestHandler } from '_/renderer/engine-requests/engineRequestHandler';
import { IMAGE_CLASSIFICATION } from '_view_helpers/constants/modelConstants';
import { toast, waitTillEngineJobComplete } from '_/renderer/view/helpers/functionHelpers';
import { refreshDatasetListAction } from '_/renderer/state/dataset-list/DatasetListActions';

interface Props {
	onClose: () => void;
	isOpen: boolean;
	refreshDataset: () => void;
}

const CreateDatasetC = React.memo(({ onClose, isOpen, refreshDataset }: Props) => {
	// Toast
	// Dataset creation status
	const [datasetCreating, setDatasetCreating] = useState(false);
	const [datasetName, setDatasetName] = useState('');
	const cancelCreateDatasetRef = useRef(null);

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
				title: `Error creating dataset '${datasetName}'`,
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
		// No success toast as this is an Engine job and is handled by Engine socket.io notifications
		onClose();
		refreshDataset();
	};
	return (
		<AlertDialog
			isOpen={isOpen}
			onClose={() => {
				setDatasetName('');
				onClose();
			}}
			isCentered
			blockScrollOnMount
			leastDestructiveRef={cancelCreateDatasetRef}
			motionPreset='slideInBottom'
			scrollBehavior='inside'>
			<AlertDialogOverlay />
			<AlertDialogContent>
				<AlertDialogHeader>Create Dataset</AlertDialogHeader>
				<AlertDialogBody pb='4'>
					<VStack spacing='2' alignItems='flex-start'>
						<Text fontWeight='semibold' as='h4' fontSize='sm' pl='1' mb='1'>
							Name
						</Text>
						<Input
							value={datasetName}
							onChange={handleDatasetNameChange}
							w='fit-content'
							variant='filled'
							placeholder="Enter the dataset's name"
						/>
					</VStack>
				</AlertDialogBody>
				<AlertDialogFooter>
					<Button ref={cancelCreateDatasetRef} variant='ghost' mr='2' colorScheme='thia.gray'>
						Cancel
					</Button>
					<Button isLoading={datasetCreating} onClick={createDataset} colorScheme='thia.purple'>
						Create
					</Button>
				</AlertDialogFooter>
			</AlertDialogContent>
		</AlertDialog>
	);
});

CreateDatasetC.displayName = 'CreateDataset';

/**
 * Modal that opens when creating a new dataset.
 */
export const CreateDataset = connect(null, {
	refreshDataset: refreshDatasetListAction,
})(CreateDatasetC);
