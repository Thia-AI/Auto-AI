import React, { useState } from 'react';

import {
	AlertDialog,
	AlertDialogContent,
	Text,
	AlertDialogHeader,
	AlertDialogOverlay,
	Badge,
	AlertDialogBody,
	AlertDialogFooter,
	Button,
	useToast,
} from '@chakra-ui/react';
import { connect } from 'react-redux';
import { IOpenCloseDeleteDatasetReducer } from '_/renderer/state/delete-modals/model/reducerTypes';
import { openCloseDeleteDatasetAction } from '_/renderer/state/delete-modals/DeleteModalsActions';
import { IAppState } from '_/renderer/state/reducers';
import { Dataset, nullDataset } from '../../helpers/constants/engineDBTypes';
import { IOpenCloseDeleteDatasetAction } from '_/renderer/state/delete-modals/model/actionTypes';
import { EngineActionHandler } from '_/renderer/engine-requests/engineActionHandler';
import { waitTillEngineJobComplete } from '../../helpers/engineJobHelper';
import { refreshDatasetListAction } from '_/renderer/state/dataset-list/DatasetListActions';

interface Props {
	deleteDatasetData: IOpenCloseDeleteDatasetReducer;
	openCloseDeleteDataset: (dataset: Dataset) => IOpenCloseDeleteDatasetAction;
	refreshDataset: () => void;
}

const DeleteDatasetC = React.memo((props: Props) => {
	const toast = useToast();
	const [datasetDeleting, setDatasetDeleting] = useState(false);

	const { datasetValue, openCloseValue } = props.deleteDatasetData;

	const cancelDeleteRef = React.useRef(null);

	return (
		<AlertDialog
			isCentered
			isOpen={openCloseValue}
			leastDestructiveRef={cancelDeleteRef}
			onClose={() => props.openCloseDeleteDataset(nullDataset)}>
			<AlertDialogOverlay>
				<AlertDialogContent>
					<AlertDialogHeader flexDirection='column'>
						<Badge ml='0.5' fontSize='sm' colorScheme='red' mb='2'>
							DANGER ZONE
						</Badge>

						<Text isTruncated fontWeight='normal'>
							Delete Dataset: {datasetValue.name}
						</Text>
					</AlertDialogHeader>

					<AlertDialogBody>
						<Text fontSize='sm'>
							Are you sure? This will delete all dataset images and data. It cannot be
							reverted...
						</Text>
					</AlertDialogBody>

					<AlertDialogFooter>
						<Button
							variant='ghost'
							ref={cancelDeleteRef}
							onClick={() => props.openCloseDeleteDataset(nullDataset)}>
							Cancel
						</Button>
						<Button
							isLoading={datasetDeleting}
							colorScheme='red'
							onClick={async () => {
								setDatasetDeleting(true);
								const [deleteDatasetErr, deleteDatasetRes] =
									await EngineActionHandler.getInstance().deleteDataset(
										datasetValue.id,
									);
								if (deleteDatasetErr) {
									toast({
										title: 'Error',
										description: `${deleteDatasetRes['Error']}`,
										status: 'error',
										duration: 1500,
										isClosable: false,
									});
									props.openCloseDeleteDataset(nullDataset);
									setDatasetDeleting(false);
									return;
								}
								// Wait until deletion job has completed
								await waitTillEngineJobComplete(deleteDatasetRes['ids'][0]);
								setDatasetDeleting(false);
								toast({
									title: 'Success',
									description: 'Dataset Deleted Successfully',
									status: 'success',
									duration: 1500,
									isClosable: false,
								});
								props.openCloseDeleteDataset(nullDataset);
								// Refresh list of datasets
								// TODO: Refresh
								props.refreshDataset();
							}}
							ml='3'>
							Delete
						</Button>
					</AlertDialogFooter>
				</AlertDialogContent>
			</AlertDialogOverlay>
		</AlertDialog>
	);
});

const mapStateToProps = (state: IAppState) => ({
	deleteDatasetData: state.openCloseDeleteDataset,
});
export const DeleteDataset = connect(mapStateToProps, {
	openCloseDeleteDataset: openCloseDeleteDatasetAction,
	refreshDataset: refreshDatasetListAction,
})(DeleteDatasetC);
