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
import { Replace, replace } from 'connected-react-router';
import React, { useRef, useState } from 'react';
import { connect } from 'react-redux';
import { EngineRequestHandler } from '_/renderer/engine-requests/engineRequestHandler';
import { IChangeSelectedPageAction } from '_/renderer/state/side-menu/model/actionTypes';
import { changeSelectedPageAction } from '_/renderer/state/side-menu/SideModelAction';
import { Model } from '../../helpers/constants/engineDBTypes';
import { MODELS_PAGE } from '../../helpers/constants/pageConstants';
import { toast, waitTillEngineJobComplete } from '../../helpers/functionHelpers';

interface Props {
	dialogOpen: boolean;
	onClose: () => void;
	model: Model;
	replace: Replace;
	changeSelectedPage: (pageNumber: number) => IChangeSelectedPageAction;
}
const DeleteModelC = React.memo(({ dialogOpen, model, onClose, replace, changeSelectedPage }: Props) => {
	const cancelDeleteRef = useRef(null);
	const [modelDeleting, setModelDeleting] = useState(false);

	const deleteModel = async () => {
		if (model.id.length > 0) {
			setModelDeleting(true);
			const [deleteModelErr, deleteModelRes] = await EngineRequestHandler.getInstance().deleteModel(model.id);
			if (deleteModelErr) {
				toast({
					title: 'Error',
					description: `${deleteModelRes['Error']}`,
					status: 'error',
					duration: 1500,
					isClosable: false,
				});
				setModelDeleting(false);
				return;
			}
			// Wait until the deletion job has completed
			await waitTillEngineJobComplete(deleteModelRes['ids'][0]);
			// Complete! Send a notification to user
			setModelDeleting(false);
			// No success toast as this is an Engine job and is handled by Engine socket.io notifications
			changeSelectedPage(MODELS_PAGE);
			replace('/models');
		}
	};
	return (
		<AlertDialog isCentered isOpen={dialogOpen} leastDestructiveRef={cancelDeleteRef} onClose={onClose}>
			<AlertDialogOverlay>
				<AlertDialogContent>
					<AlertDialogHeader flexDirection='column'>
						<Badge ml='0.5' fontSize='sm' colorScheme='red' mb='2'>
							DANGER ZONE
						</Badge>

						<Text isTruncated fontWeight='normal'>
							Delete Model: {model.model_name}
						</Text>
					</AlertDialogHeader>

					<AlertDialogBody>
						<Text fontSize='sm'>
							Are you sure? This will delete all model data and model exports. It cannot be reverted...
						</Text>
					</AlertDialogBody>

					<AlertDialogFooter>
						<Button variant='ghost' ref={cancelDeleteRef} onClick={onClose}>
							Cancel
						</Button>
						<Button isLoading={modelDeleting} colorScheme='red' onClick={deleteModel} ml='3'>
							Delete
						</Button>
					</AlertDialogFooter>
				</AlertDialogContent>
			</AlertDialogOverlay>
		</AlertDialog>
	);
});

DeleteModelC.displayName = 'DeleteModel';

/**
 * Dialog to delete a model.
 */
export const DeleteModel = connect(null, {
	replace,
	changeSelectedPage: changeSelectedPageAction,
})(DeleteModelC);
