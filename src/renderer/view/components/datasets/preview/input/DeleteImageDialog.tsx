import {
	AlertDialog,
	AlertDialogBody,
	AlertDialogContent,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogOverlay,
	Text,
	Badge,
	Button,
	Flex,
} from '@chakra-ui/react';
import React, { useRef, useState } from 'react';
import { connect } from 'react-redux';
import { useUser } from 'reactfire';
import { EngineRequestHandler } from '_/renderer/engine-requests/engineRequestHandler';
import { getNextPageInputsAction } from '_/renderer/state/active-dataset-inputs/ActiveDatasetInputsActions';
import { changeActiveDataset, datasetFetchingAction } from '_/renderer/state/active-dataset-page/ActiveDatasetActions';
import {
	IDatasetFetchingAction,
	IChangeActiveDatasetAction,
} from '_/renderer/state/active-dataset-page/model/actionTypes';
import { Dataset, Input, Labels } from '_/renderer/view/helpers/constants/engineTypes';
import { toast } from '_/renderer/view/helpers/functionHelpers';

interface Props {
	isOpen: boolean;
	onClose: () => void;
	activeInput: Input;
	datasetID: string;
	setDatasetFetching: (value: boolean) => IDatasetFetchingAction;
	changeActiveDataset: (activeDataset: Dataset, labels: Labels) => IChangeActiveDatasetAction;
	getNextPageInputs: (datasetID: string, cursorDate: string) => void;
}
const DeleteImageDialogC = React.memo(
	({
		isOpen,
		onClose,
		activeInput,
		datasetID,
		setDatasetFetching,
		getNextPageInputs,
		changeActiveDataset,
	}: Props) => {
		const [inputDeleting, setInputDeleting] = useState(false);

		const cancelDeleteRef = useRef(null);
		const { data: user } = useUser();

		const refreshDatasetAndInputs = async () => {
			if (datasetID.length === 0) return;
			setDatasetFetching(true);
			const [datasetError, datasetResData] = await EngineRequestHandler.getInstance().getDataset(datasetID);
			const [datasetLabelsError, datasetLabelsResData] =
				await EngineRequestHandler.getInstance().getDatasetLabels(datasetID);
			if (!datasetError && !datasetLabelsError) {
				changeActiveDataset(datasetResData, datasetLabelsResData);
			}
			// Get next pages from oldest date possible.
			const someOldDateBase64 = Buffer.from(new Date(0).toLocaleString()).toString('base64');
			getNextPageInputs(datasetID, someOldDateBase64);
			setDatasetFetching(false);
		};

		const deleteImage = async () => {
			if (!user) return;
			setInputDeleting(true);
			const idToken = await user.getIdToken();
			const [deleteInputError, deleteInputResData] = await EngineRequestHandler.getInstance().deleteInput(
				idToken,
				datasetID,
				activeInput.id,
			);
			if (deleteInputError) {
				toast({
					title: 'Image Deletion failed',
					description: deleteInputResData['Error'],
					status: 'error',
					duration: 3500,
					isClosable: true,
					uid: user.uid,
				});
			} else {
				toast({
					title: 'Image Deleted',
					description: 'Image Deleted Successfully',
					status: 'success',
					duration: 3500,
					isClosable: false,
					uid: user.uid,
				});
				await refreshDatasetAndInputs();
			}
			setInputDeleting(false);
			onClose();
		};
		return (
			<AlertDialog isCentered isOpen={isOpen} leastDestructiveRef={cancelDeleteRef} onClose={onClose}>
				<AlertDialogOverlay>
					<AlertDialogContent>
						<AlertDialogHeader flexDir='column'>
							<Badge ml='0.5' fontSize='sm' colorScheme='red' mb='2'>
								DANGER ZONE
							</Badge>
							<Text noOfLines={1} fontWeight='normal'>
								Delete Image
							</Text>
						</AlertDialogHeader>
						<AlertDialogBody>
							<Flex alignItems='baseline'>
								<Text fontSize='sm'>Are you sure? This will delete the image</Text>
								<Badge ml='1' textTransform='none' colorScheme='thia.gray'>
									{activeInput.file_name}
								</Badge>
							</Flex>
						</AlertDialogBody>
						<AlertDialogFooter>
							<Button ref={cancelDeleteRef} variant='ghost' onClick={onClose}>
								Cancel
							</Button>
							<Button
								colorScheme='red'
								ml='3'
								onClick={deleteImage}
								isLoading={inputDeleting}
								loadingText='Deleting'>
								Delete
							</Button>
						</AlertDialogFooter>
					</AlertDialogContent>
				</AlertDialogOverlay>
			</AlertDialog>
		);
	},
);

DeleteImageDialogC.displayName = 'DeleteImageDialog';

/**
 * Alert dialog to confirm image deletion.
 */
export const DeleteImageDialog = connect(undefined, {
	changeActiveDataset,
	getNextPageInputs: getNextPageInputsAction,
	setDatasetFetching: datasetFetchingAction,
})(DeleteImageDialogC);
