import React, { useEffect, useState } from 'react';

import { Button, Input, InputGroup, InputRightElement, useToast } from '@chakra-ui/react';
import { IoAddOutline } from 'react-icons/io5';

import { EngineActionHandler } from '_/renderer/engine-requests/engineActionHandler';
import { Dataset } from '_/renderer/view/helpers/constants/engineDBTypes';
import { connect } from 'react-redux';
import { IAppState } from '_/renderer/state/reducers';
import { changeActiveDataset } from '_/renderer/state/active-dataset-page/ActiveDatasetActions';
import { IChangeActiveDatasetAction } from '_/renderer/state/active-dataset-page/model/actionTypes';

interface Props {
	activeDataset: Dataset | undefined;
	changeActiveDataset: (activeDataset: Dataset) => IChangeActiveDatasetAction;
	labelValue: string;
	resetLabelValue: () => void;
	onInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
	isInputValid: boolean;
	inputError: string;
	setIsInputFocused: (isInputFocused: boolean) => void;
	isInputFocused: boolean;
}

const AddLabelC = React.memo(
	({
		activeDataset,
		changeActiveDataset,
		labelValue,
		resetLabelValue,
		onInputChange,
		isInputValid,
		inputError,
		setIsInputFocused,
		isInputFocused,
	}: Props) => {
		const toast = useToast();

		const [labelUploading, setLabelUploading] = useState(false);

		const addLabelInputFocusChange = (focusedIn: boolean) => {
			setIsInputFocused(focusedIn);
		};

		const addLabel = async () => {
			if (!activeDataset) return;

			if (!isInputValid) {
				toast({
					title: 'Error',
					description: inputError,
					status: 'error',
					duration: 1250,
					isClosable: true,
				});
				return;
			}
			setLabelUploading(true);
			const [addLabelErr, addLabelRes] =
				await EngineActionHandler.getInstance().addLabelToDataset(activeDataset.id, {
					label: labelValue,
				});

			if (addLabelErr) {
				toast({
					title: 'Failed to add Label',
					description: addLabelRes['Error'],
					status: 'error',
					duration: 1500,
					isClosable: true,
				});
				resetLabelValue();
				setLabelUploading(false);
				return;
			}
			changeActiveDataset(addLabelRes['dataset']);
			toast({
				title: 'Success',
				description: `Added Label '${labelValue}' to Dataset '${activeDataset.name}'`,
				status: 'success',
				duration: 1500,
				isClosable: false,
			});
			resetLabelValue();
			setLabelUploading(false);
		};

		useEffect(() => {
			const addLabelOnEnter = async (event: KeyboardEvent) => {
				if (event.key == 'Enter' && isInputFocused) {
					await addLabel();
				}
			};

			window.addEventListener('keypress', addLabelOnEnter);

			return () => {
				window.removeEventListener('keypress', addLabelOnEnter);
			};
		}, [activeDataset, labelValue, inputError, isInputValid, isInputFocused]);

		return (
			<InputGroup w='93%'>
				<Input
					onFocus={() => addLabelInputFocusChange(true)}
					onBlur={() => addLabelInputFocusChange(false)}
					variant='filled'
					placeholder='Add Label'
					onChange={onInputChange}
					value={labelValue}
				/>
				<InputRightElement
					borderTopRightRadius='md'
					borderBottomRightRadius='md'
					title='Add Label'
					cursor='pointer'
					onClick={addLabel}>
					<AddLabelInputButton isLoading={labelUploading} />
				</InputRightElement>
			</InputGroup>
		);
	},
);

interface ButtonProps {
	isLoading: boolean;
}
const AddLabelInputButton = React.memo(({ isLoading }: ButtonProps) => {
	return (
		<Button
			borderTopLeftRadius='none'
			borderBottomLeftRadius='none'
			colorScheme='green'
			isLoading={isLoading}>
			<IoAddOutline transform='scale(2)' />
		</Button>
	);
});

const mapStateToProps = (state: IAppState) => ({
	activeDataset: state.activeDataset.value,
});

export const AddLabel = connect(mapStateToProps, {
	changeActiveDataset,
})(AddLabelC);
