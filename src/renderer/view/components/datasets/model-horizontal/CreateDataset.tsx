import React, { ChangeEvent, useRef, useState } from 'react';
import {
	Input,
	Button,
	AlertDialog,
	AlertDialogOverlay,
	AlertDialogContent,
	AlertDialogHeader,
	AlertDialogBody,
	AlertDialogFooter,
	Box,
	FormControl,
	FormLabel,
	FormErrorMessage,
} from '@chakra-ui/react';
import { connect } from 'react-redux';

import { EngineRequestHandler } from '_/renderer/engine-requests/engineRequestHandler';
import { IMAGE_CLASSIFICATION } from '_view_helpers/constants/modelConstants';
import { hasWhiteSpace, toast, waitTillEngineJobComplete } from '_/renderer/view/helpers/functionHelpers';
import { refreshDatasetListAction } from '_/renderer/state/dataset-list/DatasetListActions';
import { useUser } from 'reactfire';

interface Props {
	onClose: () => void;
	isOpen: boolean;
	refreshDataset: () => void;
}

const CreateDatasetC = React.memo(({ onClose, isOpen, refreshDataset }: Props) => {
	const INITIAL_MODEL_NAME_ERROR = 'Enter a name for your model.';

	const [datasetCreating, setDatasetCreating] = useState(false);
	const [datasetNameInputFocusedOnce, setDatasetNameInputFocusedOnce] = useState(false);
	const [datasetName, setDatasetName] = useState('');

	// Errors
	const [datasetNameError, setDatasetNameError] = useState(INITIAL_MODEL_NAME_ERROR);
	const [datasetNameValid, setDatasetNameValid] = useState(false);

	const { data: user } = useUser();
	const inputErrorList: [boolean, string][] = [[datasetNameValid, datasetNameError]];

	const cancelCreateDatasetRef = useRef(null);

	const closeDialog = () => {
		setDatasetName('');
		setDatasetNameError(INITIAL_MODEL_NAME_ERROR);
		setDatasetNameValid(false);
		setDatasetNameInputFocusedOnce(false);
		onClose();
	};

	const handleDatasetNameChange = (event: ChangeEvent<HTMLInputElement>) => {
		const datasetName = event.target.value;
		setDatasetName(datasetName);

		// validate
		if (datasetName.length === 0) {
			setDatasetNameError(INITIAL_MODEL_NAME_ERROR);
			setDatasetNameValid(false);
			return;
		}
		if (datasetName.length >= 20) {
			setDatasetNameError('Must be less than 20 characters');
			setDatasetNameValid(false);
			return;
		}
		const alphaNumRegex = /^[a-zA-Z0-9-_]+$/;

		if (!datasetName.match(alphaNumRegex)) {
			setDatasetNameError('Alphanumeric characters only');
			setDatasetNameValid(false);
			return;
		}

		if (hasWhiteSpace(datasetName)) {
			setDatasetNameError('No whitespace characters');
			setDatasetNameValid(false);
			return;
		}

		setDatasetNameValid(true);
		setDatasetNameError('');
	};

	const createDataset = async () => {
		if (!user) return;
		// Check for errors
		let wasError = false;
		inputErrorList.forEach((validPair) => {
			const inputValid = validPair[0];
			const inputError = validPair[1];
			if (!inputValid) {
				wasError = true;
				toast({
					title: 'Error in form',
					description: `${inputError}`,
					status: 'error',
					duration: 1500,
					isClosable: true,
					saveToStore: false,
				});
			}
		});
		if (wasError) return;

		// No error, continue
		const idToken = await user.getIdToken();
		setDatasetCreating(true);
		const [createDatasetErr, createDatasetRes] = await EngineRequestHandler.getInstance().createDataset(
			{
				name: datasetName,
				type: IMAGE_CLASSIFICATION[0],
			},
			idToken,
		);

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
		closeDialog();
		refreshDataset();
	};
	return (
		<AlertDialog
			isOpen={isOpen}
			onClose={closeDialog}
			isCentered
			blockScrollOnMount
			leastDestructiveRef={cancelCreateDatasetRef}
			motionPreset='slideInBottom'
			scrollBehavior='inside'>
			<AlertDialogOverlay />
			<AlertDialogContent>
				<AlertDialogHeader>Create Dataset</AlertDialogHeader>
				<AlertDialogBody pb='4'>
					<Box>
						<FormControl
							variant='floating'
							isRequired
							isInvalid={datasetNameInputFocusedOnce && !datasetNameValid}>
							<Input
								value={datasetName}
								onChange={handleDatasetNameChange}
								onBlur={() => setDatasetNameInputFocusedOnce(true)}
								placeholder=' '
							/>
							<FormLabel>Dataset Name</FormLabel>
							<FormErrorMessage>{datasetNameError}</FormErrorMessage>
						</FormControl>
					</Box>
				</AlertDialogBody>
				<AlertDialogFooter>
					<Button
						ref={cancelCreateDatasetRef}
						variant='ghost'
						mr='2'
						colorScheme='thia.gray'
						onClick={closeDialog}>
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
