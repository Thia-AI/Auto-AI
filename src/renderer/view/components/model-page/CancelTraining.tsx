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
import React, { useRef } from 'react';

interface Props {
	dialogOpen: boolean;
	isTrainingBeingCancelled: boolean;
	onClose: () => void;
	cancelTraining: () => Promise<void>;
}

/**
 * Dialog that opens to cancel training.
 */
export const CancelTraining = React.memo(({ dialogOpen, onClose, cancelTraining, isTrainingBeingCancelled }: Props) => {
	const cancelDeleteRef = useRef(null);

	return (
		<AlertDialog isCentered isOpen={dialogOpen} leastDestructiveRef={cancelDeleteRef} onClose={onClose}>
			<AlertDialogOverlay>
				<AlertDialogContent>
					<AlertDialogHeader flexDirection='column'>
						<Badge ml='0.5' fontSize='sm' colorScheme='orange' mb='2'>
							WARNING ZONE
						</Badge>

						<Text noOfLines={1} fontWeight='normal'>
							Cancel Training
						</Text>
					</AlertDialogHeader>

					<AlertDialogBody>
						<Text fontSize='sm'>Are you sure? This will stop training at the current epoch</Text>
					</AlertDialogBody>

					<AlertDialogFooter>
						<Button variant='ghost' ref={cancelDeleteRef} onClick={onClose}>
							Close
						</Button>
						<Button
							colorScheme='red'
							ml='3'
							isLoading={isTrainingBeingCancelled}
							onClick={async () => {
								await cancelTraining();
								onClose();
							}}>
							Cancel Training
						</Button>
					</AlertDialogFooter>
				</AlertDialogContent>
			</AlertDialogOverlay>
		</AlertDialog>
	);
});

CancelTraining.displayName = 'CancelTraining';
