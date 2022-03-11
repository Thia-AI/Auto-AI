import React, { useRef } from 'react';

import {
	AlertDialog,
	AlertDialogBody,
	AlertDialogContent,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogOverlay,
	Badge,
	Button,
	Text,
} from '@chakra-ui/react';
import { connect } from 'react-redux';
import { IAppState } from '_/renderer/state/reducers';
import { IOpenCloseDeleteLabelReducer } from '_/renderer/state/delete-modals/model/reducerTypes';
import { openCloseDeleteLabelAction } from '_/renderer/state/delete-modals/DeleteModalsActions';
import { IOpenCloseDeleteLabelAction } from '_/renderer/state/delete-modals/model/actionTypes';

interface Props {
	deleteLabelValue: IOpenCloseDeleteLabelReducer;
	openCloseDeleteLabel: (labelValue: string) => IOpenCloseDeleteLabelAction;
	deleteLabel: (label: string) => void;
	isLabelDeleting: boolean;
}

const DeleteLabelC = React.memo(({ deleteLabelValue, openCloseDeleteLabel, deleteLabel, isLabelDeleting }: Props) => {
	const { openCloseValue, labelValue } = deleteLabelValue;

	const cancelDeleteRef = useRef(null);

	return (
		<AlertDialog
			isCentered
			isOpen={openCloseValue}
			leastDestructiveRef={cancelDeleteRef}
			onClose={() => openCloseDeleteLabel('')}>
			<AlertDialogOverlay>
				<AlertDialogContent>
					<AlertDialogHeader flexDir='column'>
						<Badge ml='0.5' fontSize='sm' colorScheme='red' mb='2'>
							DANGER ZONE
						</Badge>

						<Text isTruncated fontWeight='normal'>
							Delete Label: {labelValue}
						</Text>
					</AlertDialogHeader>
					<AlertDialogBody>
						<Text fontSize='sm'>
							Are you sure? This will delete the label and reset all respective image labels to
							&rsquo;unlabelled&rsquo; ...
						</Text>
					</AlertDialogBody>
					<AlertDialogFooter>
						<Button ref={cancelDeleteRef} variant='ghost' onClick={() => openCloseDeleteLabel('')}>
							Cancel
						</Button>
						<Button
							isLoading={isLabelDeleting}
							colorScheme='red'
							ml='3'
							onClick={() => deleteLabel(labelValue)}>
							Delete
						</Button>
					</AlertDialogFooter>
				</AlertDialogContent>
			</AlertDialogOverlay>
		</AlertDialog>
	);
});

DeleteLabelC.displayName = 'DeleteLabel';

const mapStateToProps = (state: IAppState) => ({
	deleteLabelValue: state.openCloseDeleteLabel,
});

/**
 * Deletes a dataset's label.
 */
export const DeleteLabel = connect(mapStateToProps, {
	openCloseDeleteLabel: openCloseDeleteLabelAction,
})(DeleteLabelC);
