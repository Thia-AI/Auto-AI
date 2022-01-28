import { Box, Button, Center, LayoutProps, Text, Wrap, WrapItem } from '@chakra-ui/react';
import React, { useEffect, useState } from 'react';
import { connect } from 'react-redux';

import { IActiveDatasetReducer } from '_/renderer/state/active-dataset-page/model/reducerTypes';
import { IAppState } from '_/renderer/state/reducers';
import {
	DATASET_LABELS_SPLITTER,
	Label,
	nullInput,
	UNLABBELED_INPUT_VALUE_LABEL,
} from '_/renderer/view/helpers/constants/engineDBTypes';
import {
	IActiveDatasetInputsReducer,
	IActiveDatasetInputsPreviewIDReducer,
} from '_/renderer/state/active-dataset-inputs/model/reducerTypes';
import { updateActiveDatasetInputLabelAction } from '_/renderer/state/active-dataset-inputs/ActiveDatasetInputsActions';
import { IUpdateDatasetInputLabelAction } from '_/renderer/state/active-dataset-inputs/model/actionTypes';
import { updateDatasetLabelAction } from '_/renderer/state/active-dataset-page/ActiveDatasetActions';
import { IUpdateDatasetLabelAction } from '_/renderer/state/active-dataset-page/model/actionTypes';
import { EngineActionHandler } from '_/renderer/engine-requests/engineActionHandler';

interface Props {
	w: LayoutProps['w'];
	h: LayoutProps['h'];
	activeDataset: IActiveDatasetReducer;
	activeDatasetInputs: IActiveDatasetInputsReducer;
	previewInputID: IActiveDatasetInputsPreviewIDReducer;
	updateInputLabel: (inputIndex: number, newLabel: string) => IUpdateDatasetInputLabelAction;
	updateDatasetLabel: (labelValue: string, label: Label) => IUpdateDatasetLabelAction;
}
const InputPreviewLabelsC = React.memo(
	({ w, h, activeDataset, activeDatasetInputs, previewInputID, updateInputLabel, updateDatasetLabel }: Props) => {
		const activeInput = activeDatasetInputs.value[previewInputID.value] ?? nullInput;
		const [ordererdLabelsByCount, setOrdererdLabelsByCount] = useState<string[]>([]);
		const [ordererdLabelsByPreference, setOrdererdLabelsByPreference] = useState<string[]>([]);

		useEffect(() => {
			// Set ordererd by preference labels only once dataset has been received
			if (activeDataset.value.dataset) {
				if (activeDataset.value.dataset.labels.trim().length > 0) {
					setOrdererdLabelsByPreference(activeDataset.value.dataset.labels.split(DATASET_LABELS_SPLITTER));
				} else {
					setOrdererdLabelsByPreference([]);
				}
			}
		}, [activeDataset.value.dataset]);

		const assignLabelToCurrentInput = async (label: string) => {
			if (activeInput.label != label) {
				// Change on UI instantly first
				updateInputLabel(previewInputID.value, label);
				const prevLabelInputCount = activeDataset.value.labels[activeInput.label].input_count;
				const currentLabelInputCount = activeDataset.value.labels[label].input_count;

				const prevLabelCopy: Label = {
					...activeDataset.value.labels[activeInput.label],
					input_count: prevLabelInputCount - 1,
				};
				const currentLabelCopy: Label = {
					...activeDataset.value.labels[label],
					input_count: currentLabelInputCount + 1,
				};

				updateDatasetLabel(activeInput.label, prevLabelCopy);
				updateDatasetLabel(label, currentLabelCopy);
				// Then send to Engine
				// PUT /dataset/input/<input_id>/new_label
				// previousLabel, currentlabel
				await EngineActionHandler.getInstance().updateInputLabel(activeInput.id, {
					previous_label: activeInput.label,
					new_label: label,
				});
			}
		};

		useEffect(() => {
			const addLabelOnNumberKeyPress = (e: KeyboardEvent) => {
				if (!isNaN(+e.key)) {
					// If the key is a number
					const labelIndex = +e.key;
					if (
						ordererdLabelsByPreference.length > 0 &&
						labelIndex >= 0 &&
						labelIndex <= ordererdLabelsByPreference.length - 1
					) {
						assignLabelToCurrentInput(ordererdLabelsByPreference[labelIndex]);
					}
				}
			};

			window.addEventListener('keydown', addLabelOnNumberKeyPress);

			return () => {
				window.removeEventListener('keydown', addLabelOnNumberKeyPress);
			};
		}, [ordererdLabelsByCount.length, activeInput]);

		useEffect(() => {
			if (Object.keys(activeDataset.value.labels).length > 0) {
				setOrdererdLabelsByCount(
					Object.keys(activeDataset.value.labels).sort((a, b) => {
						// Sort with unlabelled being at the end ALWAYS.
						if (a == UNLABBELED_INPUT_VALUE_LABEL) {
							return 1;
						} else if (b == UNLABBELED_INPUT_VALUE_LABEL) {
							return -1;
						}
						// Sort on input_count from high->low
						const aCount = activeDataset.value.labels[a].input_count;
						const bCount = activeDataset.value.labels[b].input_count;

						return aCount > bCount ? -1 : aCount < bCount ? 1 : a.localeCompare(b);
					}),
				);
			}
		}, [activeDataset]);

		const render = () => {
			if (ordererdLabelsByCount.length == 0) {
				return (
					<Center w={w} h={h}>
						No Labels
					</Center>
				);
			}
			return (
				<Center w={w} h={h}>
					<Wrap justify='center' spacing='3'>
						{ordererdLabelsByCount.map((label) => {
							// Check if label exists before rendering. This needs to be done to prevent
							// issues when label is deleted from activeDataset but the ordererd labels hasn't updated yet
							if (activeDataset.value.labels[label]) {
								// Transforms 'rgb(x, y, z)' into ['rgb', 'x', 'y', 'z', '']
								const splitColor = activeDataset.value.labels[label].color.split(/(?:,|\)|\(| )+/);
								const [r, g, b] = [splitColor[1], splitColor[2], splitColor[3]];

								return (
									<WrapItem key={label}>
										<Button
											pl='1.5'
											position='relative'
											maxW='150px'
											variant='outline'
											_hover={{
												backgroundColor: `rgba(${r}, ${g}, ${b}, 0.075)`,
											}}
											_active={{
												backgroundColor: `rgba(${r}, ${g}, ${b}, 0.2)`,
											}}
											borderColor={activeDataset.value.labels[label].color}
											leftIcon={
												<LabelLeftIcon
													count={activeDataset.value.labels[label].input_count}
													color={activeDataset.value.labels[label].color}
												/>
											}
											onClick={() => assignLabelToCurrentInput(label)}>
											<Text isTruncated={true}>{label}</Text>
										</Button>
									</WrapItem>
								);
							}
						})}
					</Wrap>
				</Center>
			);
		};

		return render();
	},
);

interface LabelLeftIconProps {
	count: number;
	color: string;
}

const LabelLeftIcon = React.memo(({ count, color }: LabelLeftIconProps) => {
	return (
		<Box top='0' position='absolute' pt='0.5'>
			<Text color={color} fontSize='9px' fontWeight='light'>
				{count}
			</Text>
		</Box>
	);
});
const mapStateToProps = (state: IAppState) => ({
	activeDataset: state.activeDataset,
	activeDatasetInputs: state.activeDatasetInputs,
	previewInputID: state.activeDatasetInputsPreviewID,
});

/**
 * Component that renders the labels of a dataset.
 */
export const InputPreviewLabels = connect(mapStateToProps, {
	updateInputLabel: updateActiveDatasetInputLabelAction,
	updateDatasetLabel: updateDatasetLabelAction,
})(InputPreviewLabelsC);
