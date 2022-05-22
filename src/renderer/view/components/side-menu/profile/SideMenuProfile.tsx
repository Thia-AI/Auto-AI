import {
	Menu,
	MenuList,
	useColorModeValue as mode,
	Text,
	MenuDivider,
	MenuItem,
	AlertDialog,
	useDisclosure,
	AlertDialogOverlay,
	AlertDialogBody,
	AlertDialogFooter,
	AlertDialogHeader,
	Badge,
	Button,
	AlertDialogContent,
} from '@chakra-ui/react';
import React from 'react';
import { signOut } from 'firebase/auth';
import { connect } from 'react-redux';
import { ProfileSelectButton } from './ProfileSelectButton';
import { useAuth, useUser } from 'reactfire';
import { IMenuOpenCloseAction } from '_/renderer/state/side-menu/model/actionTypes';
import { openCloseSideMenu } from '_/renderer/state/side-menu/SideModelAction';
import DefaultProfilePic from '_utils/images/default_profile_pic.png';

interface Props {
	openCloseSideMenu: () => IMenuOpenCloseAction;
}

type potentiallyUndefinedString = string | undefined;

const SideMenuProfileC = ({ openCloseSideMenu }: Props) => {
	const auth = useAuth();
	const { data: user } = useUser();
	const displayNameColor = mode('thia.gray.700', 'thia.gray.100');

	const { isOpen: isSignoutDialogOpen, onOpen: signoutDialogOpen, onClose: onSignoutDialogClose } = useDisclosure();
	const cancelSignoutRef = React.useRef(null);
	return (
		<>
			<Menu>
				<ProfileSelectButton
					displayName={user?.displayName}
					imageURL={(user?.photoURL as potentiallyUndefinedString) ?? DefaultProfilePic}
				/>
				<MenuList py='4' px='3'>
					<Text fontSize='sm' color={displayNameColor} fontWeight='medium' mb='2'>
						{user?.email}
					</Text>
					<MenuDivider />
					<MenuItem
						bg='red.400'
						_active={{ bg: 'red.450' }}
						_hover={{ bg: 'red.500' }}
						_focus={{ bg: 'red.500' }}
						rounded='md'
						onClick={signoutDialogOpen}>
						Logout
					</MenuItem>
				</MenuList>
			</Menu>
			<AlertDialog
				isCentered
				leastDestructiveRef={cancelSignoutRef}
				isOpen={isSignoutDialogOpen}
				onClose={onSignoutDialogClose}>
				<AlertDialogOverlay>
					<AlertDialogContent>
						<AlertDialogHeader flexDirection='column'>
							<Badge ml='0.5' fontSize='sm' colorScheme='red' mb='2'>
								ALERT
							</Badge>

							<Text isTruncated fontWeight='normal'>
								Signout
							</Text>
						</AlertDialogHeader>
						<AlertDialogBody>
							<Text fontSize='sm'>
								Are you sure you want to sign out? This will stop all ML Engine processes...
							</Text>
						</AlertDialogBody>
						<AlertDialogFooter>
							<Button variant='ghost' ref={cancelSignoutRef} onClick={onSignoutDialogClose}>
								Cancel
							</Button>
							<Button
								colorScheme='red'
								onClick={async () => {
									openCloseSideMenu();
									await signOut(auth);
								}}>
								Yes
							</Button>
						</AlertDialogFooter>
					</AlertDialogContent>
				</AlertDialogOverlay>
			</AlertDialog>
		</>
	);
};

/**
 * Expanded profile menu within side menu.
 *
 * @react
 */
export const SideMenuProfile = connect(null, {
	openCloseSideMenu,
})(SideMenuProfileC);
