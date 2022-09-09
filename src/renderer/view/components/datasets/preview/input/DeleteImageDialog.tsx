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
import React, { useRef } from 'react';
import { Input } from '_/renderer/view/helpers/constants/engineTypes';

interface Props {
	isOpen: boolean;
	onClose: () => void;
	activeInput: Input;
}
export const DeleteImageDialog = React.memo(({ isOpen, onClose, activeInput }: Props) => {
	const cancelDeleteRef = useRef(null);
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
						<Button colorScheme='red' ml='3'>
							Delete
						</Button>
					</AlertDialogFooter>
				</AlertDialogContent>
			</AlertDialogOverlay>
		</AlertDialog>
	);
});
