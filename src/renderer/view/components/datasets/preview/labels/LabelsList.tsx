import React, { useEffect, useState } from 'react';

import { Box, Flex, VStack } from '@chakra-ui/react';
import { connect } from 'react-redux';
import { DragDropContext, Droppable, DroppableProvided, DropResult } from 'react-beautiful-dnd';

import { Dataset, DATASET_LABELS_SPLITTER, Labels } from '_/renderer/view/helpers/constants/engineTypes';
import { AddLabel } from './AddLabel';
import { Label } from './Label';
import { IAppState } from '_/renderer/state/reducers';
import { InputErrorText } from './InputErrorText';
import { changeActiveDataset } from '_/renderer/state/active-dataset-page/ActiveDatasetActions';
import { EngineRequestHandler } from '_/renderer/engine-requests/engineRequestHandler';
import { openCloseDeleteLabelAction } from '_/renderer/state/delete-modals/DeleteModalsActions';
import { IChangeActiveDatasetAction } from '_/renderer/state/active-dataset-page/model/actionTypes';
import { DeleteLabel } from './DeleteLabel';
import { IOpenCloseDeleteLabelAction } from '_/renderer/state/delete-modals/model/actionTypes';
import { IActiveDatasetReducer } from '_/renderer/state/active-dataset-page/model/reducerTypes';
import { getNextPageInputsAction } from '_/renderer/state/active-dataset-inputs/ActiveDatasetInputsActions';
import { toast } from '_/renderer/view/helpers/functionHelpers';

interface Props {
	activeDataset: IActiveDatasetReducer;
	changeActiveDataset: (activeDataset: Dataset, labels: Labels) => IChangeActiveDatasetAction;
	openCloseDeleteLabel: (labelValue: string) => IOpenCloseDeleteLabelAction;
	getNextPageInputs: (datasetID: string, cursorDate: string) => void;
}

const LabelsListC = React.memo(
	({ activeDataset, changeActiveDataset, openCloseDeleteLabel, getNextPageInputs }: Props) => {
		const [labels, setLabels] = useState<string[]>([]);

		const [labelValue, setLabelValue] = useState('');
		const [isLabelDeleting, setIsLabelDeleting] = useState(false);
		const [isInputValid, setIsInputValid] = useState(false);
		const [clickedOnInputOnce, setClickedOnInputOnce] = useState(false);
		const [isInputFocused, setIsInputFocused] = useState(false);

		const [inputError, setInputError] = useState('Enter A Label');

		useEffect(() => {
			// Set labels only once dataset has been received
			if (activeDataset.value.dataset) {
				if (activeDataset.value.dataset.labels.trim().length > 0) {
					setLabels(activeDataset.value.dataset.labels.split(DATASET_LABELS_SPLITTER));
				} else {
					setLabels([]);
				}
			}
		}, [activeDataset.value.dataset]);

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

			if (!destination || destination.index === source.index || !activeDataset.value.dataset) return;

			const initialLabels = labels.slice();
			const labelsCpy = labels.slice();
			const movedLabel = labelsCpy[source.index];
			labelsCpy.splice(source.index, 1);
			labelsCpy.splice(destination.index, 0, movedLabel);

			// For instantaneous change
			setLabels(labelsCpy);

			const [updateLabelsOrderErr, updateLabelsOrderRes] =
				await EngineRequestHandler.getInstance().updateLabelsOrder(activeDataset.value.dataset.id, {
					labels: labelsCpy,
				});
			if (updateLabelsOrderErr) {
				toast({
					title: 'Failed to update label order',
					description: updateLabelsOrderRes['Error'],
					status: 'error',
					duration: 1250,
					isClosable: false,
				});
				setLabels(initialLabels);
				return;
			}
			// Have change reflect for rest of UI
			changeActiveDataset(updateLabelsOrderRes['dataset'], updateLabelsOrderRes['labels']);
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
			if (activeDataset.value.dataset.id.length == 0) return;

			setIsLabelDeleting(true);
			const [deleteLabelErr, deleteLabelRes] = await EngineRequestHandler.getInstance().deleteLabelFromDataset(
				activeDataset.value.dataset.id,
				{
					label: label,
				},
			);

			if (deleteLabelErr) {
				toast({
					title: `Failed to delete label '${label}''`,
					description: deleteLabelRes['Error'],
					status: 'error',
					duration: 1500,
					isClosable: true,
				});
				setIsLabelDeleting(false);
				return;
			}

			changeActiveDataset(deleteLabelRes['dataset'], deleteLabelRes['labels']);
			// Refresh dataset page inputs
			// Get next pages from oldest date possible.
			const someOldDateBase64 = Buffer.from(new Date(0).toLocaleString()).toString('base64');
			getNextPageInputs(activeDataset.value.dataset.id, someOldDateBase64);
			setIsLabelDeleting(false);
			toast({
				title: `Deleted label '${label}'`,
				description: `Deleted Label '${label}' from Dataset '${activeDataset.value.dataset.name}'`,
				status: 'success',
				duration: 1500,
				isClosable: false,
			});
			openCloseDeleteLabel('');
		};

		return (
			<>
				<VStack
					w='150px'
					minW='150px'
					maxW='150px'
					h='full'
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

LabelsListC.displayName = 'LabelsList';

const mapStateToProps = (state: IAppState) => ({
	activeDataset: state.activeDataset,
});

/**
 * Vertical list containing all label when editing a dataset.
 */
export const LabelsList = connect(mapStateToProps, {
	changeActiveDataset,
	openCloseDeleteLabel: openCloseDeleteLabelAction,
	getNextPageInputs: getNextPageInputsAction,
})(LabelsListC);
