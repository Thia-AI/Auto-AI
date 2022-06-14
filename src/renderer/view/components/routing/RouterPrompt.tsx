import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
	Text,
	Button,
	AlertDialog,
	AlertDialogBody,
	AlertDialogContent,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogOverlay,
	useColorModeValue as mode,
	HStack,
} from '@chakra-ui/react';

interface Props {
	when: boolean;
	onOK?: () => boolean;
	onCancel: () => boolean;
	title: string;
	okText: string;
	cancelText: string;
	bodyText?: string;
}

import { history } from '_state/store';

/**
 * Custom Prompt component when you don't want the user to leave the current page
 */
export const RouterPrompt = React.memo(
	({
		when,
		onOK,
		onCancel,
		title,
		okText,
		cancelText,
		bodyText = 'There are unsaved changes. Are you sure want to leave this page ?',
	}: Props) => {
		const [showPrompt, setShowPrompt] = useState(false);
		const [currentPath, setCurrentPath] = useState('');
		const textColor = mode('thia.gray.700', 'thia.gray.300');
		const cancelRef = useRef(null);

		useEffect(() => {
			if (when) {
				history.block((prompt) => {
					setCurrentPath(prompt.pathname);
					setShowPrompt(true);
					return 'true';
				});
			} else {
				history.block(() => {});
			}

			return () => {
				history.block(() => {});
			};
		}, [history, when]);

		const handleOK = useCallback(async () => {
			if (onOK) {
				const canRoute = await Promise.resolve(onOK());
				if (canRoute) {
					history.block(() => {});
					history.replace(currentPath);
				}
			}
		}, [currentPath, history, onOK]);

		const handleCancel = useCallback(async () => {
			if (onCancel) {
				const canRoute = await Promise.resolve(onCancel());
				if (canRoute) {
					history.block(() => {});
					history.replace(currentPath);
				}
			}
			setShowPrompt(false);
		}, [currentPath, history, onCancel]);

		return showPrompt ? (
			<AlertDialog
				isOpen={showPrompt}
				onClose={handleCancel}
				leastDestructiveRef={cancelRef}
				blockScrollOnMount
				isCentered>
				<AlertDialogOverlay />
				<AlertDialogContent>
					<AlertDialogHeader>{title}</AlertDialogHeader>
					<AlertDialogBody>
						<Text fontWeight='light' color={textColor} mb='1rem'>
							{bodyText}
						</Text>
					</AlertDialogBody>
					<AlertDialogFooter>
						<HStack spacing='6' justifyContent='flex-end'>
							<Button variant='ghost' ref={cancelRef} onClick={handleCancel}>
								{cancelText}
							</Button>
							<Button colorScheme='thia.purple' mr={3} onClick={handleOK}>
								{okText}
							</Button>
						</HStack>
					</AlertDialogFooter>
				</AlertDialogContent>
			</AlertDialog>
		) : null;
	},
);

RouterPrompt.displayName = 'RouterPrompt';
