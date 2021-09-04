import React, { useEffect, useState } from 'react';

import { Box, Flex, VStack, useToast } from '@chakra-ui/react';
import { connect } from 'react-redux';
import { DragDropContext, Droppable, DroppableProvided, DropResult } from 'react-beautiful-dnd';

import { Dataset, DATASET_LABELS_SPLITTER } from '_/renderer/view/helpers/constants/engineDBTypes';
import { AddLabel } from './AddLabel';
import { Label } from './Label';
import { IAppState } from '_/renderer/state/reducers';
import { InputErrorText } from './InputErrorText';
import { changeActiveDataset } from '_/renderer/state/active-dataset-page/ActiveDatasetActions';
import { EngineActionHandler } from '_/renderer/engine-requests/engineActionHandler';
import { openCloseDeleteLabelAction } from '_/renderer/state/delete-modals/DeleteModalsActions';
import { IChangeActiveDatasetAction } from '_/renderer/state/active-dataset-page/model/actionTypes';
import { DeleteLabel } from './DeleteLabel';
import { IOpenCloseDeleteLabelAction } from '_/renderer/state/delete-modals/model/actionTypes';

interface Props {
	activeDataset: Dataset | undefined;
	changeActiveDataset: (activeDataset: Dataset) => IChangeActiveDatasetAction;
	openCloseDeleteLabel: (labelValue: string) => IOpenCloseDeleteLabelAction;
}

const LabelsListC = React.memo(
	({ activeDataset, changeActiveDataset, openCloseDeleteLabel }: Props) => {
		const toast = useToast();

		const [labels, setLabels] = useState<string[]>([]);

		const [labelValue, setLabelValue] = useState('');
		const [isLabelDeleting, setIsLabelDeleting] = useState(false);
		const [isInputValid, setIsInputValid] = useState(false);
		const [clickedOnInputOnce, setClickedOnInputOnce] = useState(false);
		const [isInputFocused, setIsInputFocused] = useState(false);

		const [inputError, setInputError] = useState('Enter A Label');

		useEffect(() => {
			// Set labels only once dataset has been received and
			if (activeDataset && activeDataset.labels.trim().length > 0) {
				setLabels(activeDataset.labels.split(DATASET_LABELS_SPLITTER));
			}
		}, [activeDataset]);

		const onInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
			setClickedOnInputOnce(true);

			const val = e.target.value;
			setLabelValue(val);

			if (val.length === 0) {
				setInputError('Enter A Label');
				setIsInputValid(false);
				return;
			}
			const regex = /^[a-zA-Z0-9-_]+$/;
			if (val.search(regex) === -1) {
				setInputError('Alphanum Chars Only');
				setIsInputValid(false);
				return;
			}
			setIsInputValid(true);
			setInputError('');
		};

		const onDragEnd = async (result: DropResult) => {
			const { destination, source } = result;

			if (!destination || destination.index === source.index || !activeDataset) return;

			const initialLabels = labels.slice();
			const labelsCpy = labels.slice();
			const movedLabel = labelsCpy[source.index];
			labelsCpy.splice(source.index, 1);
			labelsCpy.splice(destination.index, 0, movedLabel);

			// For instantaneous change
			setLabels(labelsCpy);

			const [updateLabelsOrderErr, updateLabelsOrderRes] =
				await EngineActionHandler.getInstance().updateLabelsOrder(activeDataset.id, {
					labels: labelsCpy,
				});
			if (updateLabelsOrderErr) {
				toast({
					title: 'Failed to update order',
					description: updateLabelsOrderRes['Error'],
					status: 'error',
					duration: 1250,
					isClosable: false,
				});
				setLabels(initialLabels);
				return;
			}
			// Have change reflect for rest of UI
			changeActiveDataset(updateLabelsOrderRes['dataset']);
		};

		const renderList = (provided: DroppableProvided) => {
			return (
				<Box w='full' h='full' {...provided.droppableProps} ref={provided.innerRef}>
					{labels.map((label, index) => (
						<Label label={label} key={label} index={index} />
					))}
					{provided.placeholder}
				</Box>
			);
		};

		const renderLabelList = () => {
			return (
				<DragDropContext onDragEnd={onDragEnd}>
					<Droppable droppableId='labels-list'>{renderList}</Droppable>
				</DragDropContext>
			);
		};

		const deleteLabel = async (label: string) => {
			if (!activeDataset) return;

			setIsLabelDeleting(true);
			const [deleteLabelErr, deleteLabelRes] =
				await EngineActionHandler.getInstance().deleteLabelFromDataset(activeDataset.id, {
					label: label,
				});

			if (deleteLabelErr) {
				toast({
					title: `Failed to delete Label '${label}''`,
					description: deleteLabelRes['Error'],
					status: 'error',
					duration: 1500,
					isClosable: true,
				});
				setIsLabelDeleting(false);
				return;
			}

			changeActiveDataset(deleteLabelRes['dataset']);
			setIsLabelDeleting(false);
			toast({
				title: 'Success',
				description: `Deleted Label '${label}' from Dataset'`,
				status: 'success',
				duration: 1500,
				isClosable: false,
			});
			openCloseDeleteLabel('');
		};

		return (
			<>
				<VStack
					w='175px'
					h='full'
					bg='gray.800'
					pt='2'
					borderTopLeftRadius='sm'
					borderBottomLeftRadius='sm'>
					<Flex
						flexDir='column'
						alignItems='center'
						w='full'
						h='full'
						borderTopLeftRadius='sm'
						borderBottomLeftRadius='sm'>
						{renderLabelList()}
					</Flex>
					<AddLabel
						isInputValid={isInputValid}
						inputError={inputError}
						labelValue={labelValue}
						resetLabelValue={() => setLabelValue('')}
						onInputChange={onInputChange}
						setIsInputFocused={setIsInputFocused}
						isInputFocused={isInputFocused}
					/>
					<InputErrorText
						isInputValid={isInputValid}
						isInputFocused={isInputFocused}
						inputError={inputError}
						clickedOnInputOnce={clickedOnInputOnce}
					/>
				</VStack>
				<DeleteLabel deleteLabel={deleteLabel} isLabelDeleting={isLabelDeleting} />
			</>
		);
	},
);

const mapStateToProps = (state: IAppState) => ({
	activeDataset: state.activeDataset.value,
});

export const LabelsList = connect(mapStateToProps, {
	changeActiveDataset,
	openCloseDeleteLabel: openCloseDeleteLabelAction,
})(LabelsListC);
