import React, { useEffect, useRef, useState } from 'react';
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

	title: string;
	okText: string;
	cancelText: string;
	bodyText?: string;
}

import { history } from '_state/store';
import { useNavigate } from 'react-router';

/**
 * Custom Prompt component when you don't want the user to leave the current page
 */
export const RouterPrompt = React.memo(
	({
		when,
		title,
		okText,
		cancelText,
		bodyText = 'There are unsaved changes. Are you sure want to leave this page ?',
	}: Props) => {
		const [showPrompt, setShowPrompt] = useState(false);
		const [unblock, setUnblock] = useState<(() => void) | null>(null);
		const [transitionPath, setTransitionPath] = useState('');
		const navigate = useNavigate();
		const textColor = mode('thia.gray.700', 'thia.gray.300');
		const cancelRef = useRef(null);

		useEffect(() => {
			console.log(when);
			if (when) {
				const unblock = history.block((transition) => {
					setTransitionPath(transition.location.pathname);
					setShowPrompt(true);
					console.log(transition.action);
					if (window.confirm(bodyText)) {
						// Unblock the navigation.
						unblock();

						// Retry the transition.
						transition.retry();
					}
				});
				setUnblock(unblock);
			} else {
				if (unblock) {
					unblock();
				}
			}

			return () => {
				if (unblock) {
					unblock();
					setUnblock(null);
				}
			};
		}, [history, when]);

		const handleOK = () => {
			if (unblock) unblock();
			navigate(transitionPath, { replace: true });
			// history.replace(transitionPath);
		};

		const handleCancel = () => {
			setShowPrompt(false);
		};

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
