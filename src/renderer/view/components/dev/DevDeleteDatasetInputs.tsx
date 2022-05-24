import React, { useState } from 'react';

import {
	Button,
	FormControl,
	FormLabel,
	HStack,
	Input,
	InputGroup,
	InputLeftElement,
	useToast,
} from '@chakra-ui/react';
import { AiFillDatabase } from 'react-icons/ai';
import { EngineRequestHandler } from '_/renderer/engine-requests/engineRequestHandler';
import { toast, waitTillEngineJobComplete } from '../../helpers/functionHelpers';

/**
 * Dev panel deleting dataset inputs component.
 */
export const DevDeleteDatasetInputs = React.memo(() => {
	const [value, setValue] = useState('');
	const [inputsDeleting, setInputsDeleting] = useState(false);

	const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		setValue(e.target.value);
	};

	const deleteInputs = async (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
		e.preventDefault();
		setInputsDeleting(true);
		const [deleteInputsErr, deleteInputsRes] = await EngineRequestHandler.getInstance().deleteAllInputsFromDataset(
			value,
		);
		if (deleteInputsErr) {
			toast({
				title: 'Error',
				description: `${deleteInputsRes['Error']}`,
				status: 'error',
				duration: 1500,
				isClosable: false,
			});
			setInputsDeleting(false);
			return;
		}
		// Wait until deletion job has completed
		await waitTillEngineJobComplete(deleteInputsRes['ids'][0]);
		setInputsDeleting(false);
		toast({
			title: 'Success',
			description: 'Inputs Deleted Successfully',
			status: 'success',
			duration: 1500,
			isClosable: false,
		});
	};
	return (
		<HStack w='full'>
			<FormControl id='dev-delete-dataset-inputs'>
				<InputGroup>
					<FormLabel srOnly>Enter dataset ID of inputs to delete</FormLabel>
					<InputLeftElement pointerEvents='none' fontSize='sm' color='gray.600'>
						<AiFillDatabase />
					</InputLeftElement>
					<Input bg='gray.800' placeholder="Enter input's dataset ID" value={value} onChange={handleChange} />
				</InputGroup>
			</FormControl>

			<Button isLoading={inputsDeleting} type='submit' colorScheme='blue' minW='24' onClick={deleteInputs}>
				Delete
			</Button>
		</HStack>
	);
});

DevDeleteDatasetInputs.displayName = 'DevDeleteDatasetInputs';
