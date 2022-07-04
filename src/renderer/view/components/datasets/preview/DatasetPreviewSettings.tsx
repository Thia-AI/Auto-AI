import {
	AlertDialog,
	AlertDialogBody,
	AlertDialogContent,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogOverlay,
	Box,
	Button,
	Text,
	Flex,
	FormControl,
	FormErrorMessage,
	FormLabel,
	IconButton,
	Input,
	Menu,
	MenuButton,
	MenuItem,
	MenuList,
	useColorModeValue as mode,
	useDisclosure,
	VStack,
	Link,
	Center,
	chakra,
	HStack,
	Spacer,
	Icon,
} from '@chakra-ui/react';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { ErrorCode, FileRejection, useDropzone } from 'react-dropzone';
import { BsThreeDotsVertical } from 'react-icons/bs';
import { IoCloseOutline } from 'react-icons/io5';
import { toast } from '_/renderer/view/helpers/functionHelpers';
import { formatBytesToString } from '_/renderer/view/helpers/textHelper';

export const DatasetPreviewSettings = React.memo(() => {
	const menuButtonBGHover = mode('thia.gray.200', 'thia.gray.700');
	const menuButtonBGClicking = mode('thia.gray.100', 'thia.gray.600');
	const inputColor = mode('thia.gray.700', 'thia.gray.500');
	const fileInformationBG = mode('thia.gray.50', 'thia.gray.700');
	const borderColor = mode('thia.gray.200', 'thia.gray.700');

	const [selectedLabelFile, setSelectedLabelFile] = useState<File | null>(null);
	const [rejectedLabelFiles, setRejectedLabelFiles] = useState<FileRejection[]>([]);
	const cancelUploadLabelsButtonRef = useRef(null);

	const {
		isOpen: isUploadLabelsDialogOpen,
		onClose: onCloseUploadLabelsDialog,
		onOpen: openUploadLabelsDialog,
	} = useDisclosure();

	const closeUploadLabelsDialog = () => {
		onCloseUploadLabelsDialog();
		setRejectedLabelFiles([]);
		setSelectedLabelFile(null);
	};

	const onDrop = useCallback((acceptedFiles: File[], rejected: FileRejection[]) => {
		if (acceptedFiles.length === 1) {
			setSelectedLabelFile(acceptedFiles[0]);
		}
		setRejectedLabelFiles(rejected);
	}, []);

	const { getRootProps, getInputProps, isDragActive, isDragReject, draggedFiles } = useDropzone({
		onDrop,
		accept: ['application/json'],
		multiple: false,
		maxFiles: 1,
	});

	// Rejected file error informing
	useEffect(() => {
		console.log(rejectedLabelFiles);
		if (rejectedLabelFiles.length > 0) {
			if (rejectedLabelFiles[0].errors[0].code == ErrorCode.FileInvalidType) {
				// Invalid file type
				toast({
					title: 'Error',
					description: 'Can only select a JSON file',
					status: 'error',
					duration: 1500,
					isClosable: false,
					saveToStore: false,
				});
			} else if (rejectedLabelFiles[0].errors[0].code == ErrorCode.TooManyFiles) {
				// Too many files selected
				toast({
					title: 'Error',
					description: `Cannot select more than 1 label file`,
					status: 'error',
					duration: 1500,
					isClosable: false,
					saveToStore: false,
				});
			}
			// Reset
			setRejectedLabelFiles([]);
		}
	}, [rejectedLabelFiles]);

	const renderLabelFileInformation = () => {
		if (selectedLabelFile) {
			return (
				<HStack
					bg={fileInformationBG}
					rounded='md'
					w='full'
					px='2'
					py='1'
					borderColor={borderColor}
					borderWidth='1px'>
					<Text noOfLines={1}>{selectedLabelFile.name}</Text>
					<Spacer />
					<HStack>
						<Text>{formatBytesToString(selectedLabelFile.size)}</Text>
						<Icon
							fontSize='lg'
							cursor='pointer'
							color='red.400'
							transition='all 200ms'
							title='Remove File'
							aria-label='Remove File'
							as={IoCloseOutline}
							_hover={{
								color: 'red.500',
								transform: 'scale(1.10)',
							}}
							onClick={() => {
								setSelectedLabelFile(null);
							}}
						/>
					</HStack>
				</HStack>
			);
		}
	};

	const renderDragText = () => {
		let text = 'Drop Label File Or Click To Select';
		let error = false;
		if (isDragActive) {
			if (isDragReject && draggedFiles.length > 1) {
				text = `Can Only Drag 1 Label File`;
				error = true;
			} else {
				text = 'Drop Label File Here...';
			}
		}
		return (
			<Text color={error ? 'red.400' : inputColor} opacity={error ? 0.8 : 1}>
				{text}
			</Text>
		);
	};
	return (
		<>
			<Flex w='full' justify='flex-end' p='2'>
				<Menu autoSelect isLazy lazyBehavior='keepMounted' closeOnBlur closeOnSelect>
					<MenuButton
						as={IconButton}
						aria-label='Model Options'
						icon={<BsThreeDotsVertical />}
						_hover={{
							bg: menuButtonBGHover,
						}}
						_active={{
							bg: menuButtonBGClicking,
						}}
						_focus={{
							bg: menuButtonBGHover,
						}}
						variant='ghost'
					/>
					<MenuList px='3'>
						<MenuItem rounded='md' onClick={() => openUploadLabelsDialog()}>
							Upload Labels
						</MenuItem>
					</MenuList>
				</Menu>
			</Flex>

			<AlertDialog
				isOpen={isUploadLabelsDialogOpen}
				onClose={closeUploadLabelsDialog}
				isCentered
				blockScrollOnMount
				leastDestructiveRef={cancelUploadLabelsButtonRef}
				motionPreset='slideInBottom'
				scrollBehavior='inside'>
				<AlertDialogOverlay />
				<AlertDialogContent w='80vw'>
					<AlertDialogHeader>Upload Labels</AlertDialogHeader>
					<AlertDialogBody pb='4'>
						<VStack w='full' alignItems='flex-start' spacing='6'>
							<Text fontSize='15px'>
								When labelling a dataset, it is tedious to do so for each image manually. To make
								labelling quicker, upload a labels JSON file to quickly label your entire dataset.
							</Text>

							<Link fontSize='sm' href='https://google.ca'>
								Learn more about the format of the file here
							</Link>
							{renderLabelFileInformation()}
							<Center
								w='full'
								flex='1 1 auto'
								willChange='border-color'
								py='6'
								_hover={{
									borderColor: 'thia.purple.400',
								}}
								cursor='pointer'
								border='2px dashed'
								borderRadius='md'
								transition='all 250ms ease'
								outline='none'
								borderColor={
									isDragReject && draggedFiles.length > 1
										? 'red.400'
										: isDragActive
										? 'green.400'
										: inputColor
								}
								overflow='hidden'
								color={mode('thia.dark.700', 'thia.dark.500')}
								{...getRootProps()}>
								<chakra.input {...getInputProps()} />
								{renderDragText()}
							</Center>
						</VStack>
					</AlertDialogBody>
					<AlertDialogFooter>
						<Button
							ref={cancelUploadLabelsButtonRef}
							variant='ghost'
							mr='4'
							colorScheme='thia.gray'
							onClick={() => closeUploadLabelsDialog()}>
							Cancel
						</Button>
						<Button colorScheme='thia.purple'>Upload</Button>
					</AlertDialogFooter>
				</AlertDialogContent>
			</AlertDialog>
		</>
	);
});
