import {
	Button,
	Center,
	FormControl,
	FormErrorMessage,
	FormLabel,
	Heading,
	HStack,
	Input,
	Stack,
	useBreakpointValue,
	Text,
	chakra,
	Wrap,
	Container,
	useToast,
} from '@chakra-ui/react';
import axios from 'axios';
import { FirebaseError } from 'firebase/app';
import {
	GoogleAuthProvider,
	signInWithRedirect,
	signInWithEmailAndPassword,
	updateProfile,
	AuthErrorCodes,
	AuthError,
	createUserWithEmailAndPassword,
	sendEmailVerification,
} from 'firebase/auth';
import React, { useEffect, useState } from 'react';
import { useHistory } from 'react-router';
import { useAuth } from 'reactfire';
import { PERSISTENCE_TYPE } from '_/shared/appConstants';

import GoogleDarkButton from '_utils/svgs/google-button-svgs/btn_google_dark_normal_ios.svg';

const ChakraGoogleDarkButton = chakra(GoogleDarkButton);

interface Props {
	setEmailRegisteringLoading: (signInStatus: boolean) => void;
	googleRegisteringLoading: boolean;
	emailRegisteringLoading: boolean;
	postLoginToken: (uid: string, persistence: PERSISTENCE_TYPE) => Promise<void>;
}
const Register = React.memo(
	({ googleRegisteringLoading, emailRegisteringLoading, setEmailRegisteringLoading, postLoginToken }: Props) => {
		const auth = useAuth();
		const provider = new GoogleAuthProvider();

		provider.setCustomParameters({
			prompt: 'select_account consent',
		});

		const history = useHistory();
		const toast = useToast();

		const [userRegistrationDetails, setUserRegistrationDetails] = useState({
			fullName: '',
			emailAddress: '',
			password: '',
			passwordRetype: '',
		});

		type UserRegistrationDetailNames = keyof typeof userRegistrationDetails;

		const [userRegistrationErrorMessages, setUserRegistrationErrorMessages] = useState({
			fullName: '',
			emailAddress: '',
			password: '',
			passwordRetype: '',
		});

		const [userRegistrationFocusedOnce, setUserRegistrationFocusedOnce] = useState({
			fullName: false,
			emailAddress: false,
			password: false,
			passwordRetype: false,
		});

		const googleLogin = async () => {
			await signInWithRedirect(auth, provider);
		};

		const handleRegistrationInputsFocused = (e: React.FocusEvent<HTMLInputElement>) => {
			const name: UserRegistrationDetailNames = e.target.name as UserRegistrationDetailNames;
			setUserRegistrationFocusedOnce({
				...userRegistrationFocusedOnce,
				[name]: true,
			});
		};

		const handleRegistrationInputsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
			const val = e.target.value;
			const name: UserRegistrationDetailNames = e.target.name as UserRegistrationDetailNames;
			setUserRegistrationDetails({
				...userRegistrationDetails,
				[name]: val,
			});
			switch (name) {
				case 'emailAddress':
					// Email address input handling
					const emailAddressPattern =
						/^(([^<>()[\]\.,;:\s@\"]+(\.[^<>()[\]\.,;:\s@\"]+)*)|(\".+\"))@(([^<>()[\]\.,;:\s@\"]+\.)+[^<>()[\]\.,;:\s@\"]{2,})$/i;
					if (!val.match(emailAddressPattern)) {
						setUserRegistrationErrorMessages({
							...userRegistrationErrorMessages,
							emailAddress: 'Invalid email address',
						});
					} else {
						setUserRegistrationErrorMessages({
							...userRegistrationErrorMessages,
							emailAddress: '',
						});
					}
					break;
				case 'fullName':
					// Full name input handling
					if (val.length < 3) {
						// Too small
						setUserRegistrationErrorMessages({
							...userRegistrationErrorMessages,
							fullName: 'Enter valid name',
						});
					} else {
						setUserRegistrationErrorMessages({
							...userRegistrationErrorMessages,
							fullName: '',
						});
					}
					break;
				case 'password':
					// Password input handling
					const passwordPattern = /(?=.*[0-9a-zA-Z]).{6,}/;
					if (!val.match(passwordPattern)) {
						setUserRegistrationErrorMessages({
							...userRegistrationErrorMessages,
							password: 'Weak password, 6 alpha-num chars',
						});
						//
					} else {
						setUserRegistrationErrorMessages({
							...userRegistrationErrorMessages,
							password: '',
						});
					}
					break;
				case 'passwordRetype':
					// Password retype input handling
					if (val !== userRegistrationDetails.password) {
						setUserRegistrationErrorMessages({
							...userRegistrationErrorMessages,
							passwordRetype: "Passwords don't match",
						});
					} else {
						setUserRegistrationErrorMessages({
							...userRegistrationErrorMessages,
							passwordRetype: '',
						});
					}
					break;
			}
		};

		const registerNewAccount = async () => {
			let userRegistrationDetailsFilledOut = true;
			for (const registrationDetailKey in userRegistrationDetails) {
				if (userRegistrationDetails[registrationDetailKey].trim() == '') {
					userRegistrationDetailsFilledOut = false;
					break;
				}
			}
			if (!userRegistrationDetailsFilledOut) {
				// Not all details filled out
				toast({
					title: 'Error',
					description: 'Registration not filled out',
					status: 'error',
					duration: 1500,
					isClosable: false,
				});
				return;
			}
			let userRegistrationErrorExists = false;
			for (const errorMessageKey in userRegistrationErrorMessages) {
				if (userRegistrationErrorMessages[errorMessageKey] != '') {
					userRegistrationErrorExists = true;
					break;
				}
			}
			if (userRegistrationErrorExists) {
				// Not all details filled out
				toast({
					title: 'Error',
					description: 'Registration contains an error',
					status: 'error',
					duration: 1500,
					isClosable: false,
				});
				return;
			}
			setEmailRegisteringLoading(true);
			createUserWithEmailAndPassword(auth, userRegistrationDetails.emailAddress, userRegistrationDetails.password)
				.then(async (userCredential) => {
					await updateProfile(userCredential.user, {
						displayName: userRegistrationDetails.fullName,
					});
					if (!userCredential.user.emailVerified) {
						// Send verification email
						await sendEmailVerification(userCredential.user);
						toast({
							title: 'Info',
							description: 'Email verification sent, check your email',
							status: 'info',
							duration: 1500,
							isClosable: false,
						});
						setEmailRegisteringLoading(false);
						history.push('/');
					} else {
						// Email already verified (don't know when this will happen but it's here in case it does)
						await postLoginToken(userCredential.user.uid, 'local');
					}
				})
				.catch((error: FirebaseError) => {
					const errorCode = error.code;
					const errorMessage = error.message;
					if (errorCode == AuthErrorCodes.EMAIL_EXISTS) {
						toast({
							title: 'Error',
							description: 'Email already exists',
							status: 'error',
							duration: 1500,
							isClosable: false,
						});
					} else if (errorCode == AuthErrorCodes.WEAK_PASSWORD) {
						toast({
							title: 'Error',
							description: 'Password is too weak',
							status: 'error',
							duration: 1500,
							isClosable: false,
						});
					} else if (errorCode == AuthErrorCodes.INVALID_EMAIL) {
						toast({
							title: 'Error',
							description: 'Invalid email',
							status: 'error',
							duration: 1500,
							isClosable: false,
						});
					}
					setEmailRegisteringLoading(false);
				});
		};

		return (
			<Center
				w='full'
				h='full'
				overflowX='hidden'
				sx={{
					'&::-webkit-scrollbar': {
						w: '8px',
						bg: 'gray.600',
					},
					'&::-webkit-scrollbar-thumb': {
						bg: 'gray.900',
					},
				}}>
				<Stack spacing='4'>
					<Center>
						<Heading size={useBreakpointValue({ base: 'xl', md: '2xl' })}>Register</Heading>
					</Center>
					<Stack spacing='2'>
						<FormControl
							isInvalid={
								userRegistrationFocusedOnce.fullName && userRegistrationErrorMessages.fullName != ''
							}>
							<FormLabel fontSize='14px' bgColor='var(--chakra-colors-gray-800) !important'>
								Name
							</FormLabel>
							<Input
								name='fullName'
								placeholder='Full Name'
								type='text'
								onBlur={handleRegistrationInputsFocused}
								onChange={handleRegistrationInputsChange}
							/>
							<FormErrorMessage fontSize='xs'>{userRegistrationErrorMessages.fullName}</FormErrorMessage>
						</FormControl>
						<FormControl
							isInvalid={
								userRegistrationFocusedOnce.emailAddress &&
								userRegistrationErrorMessages.emailAddress != ''
							}>
							<FormLabel fontSize='14px' bgColor='var(--chakra-colors-gray-800) !important'>
								Email
							</FormLabel>
							<Input
								name='emailAddress'
								placeholder='E-mail Address'
								type='text'
								onBlur={handleRegistrationInputsFocused}
								onChange={handleRegistrationInputsChange}
							/>
							<FormErrorMessage fontSize='xs'>
								{userRegistrationErrorMessages.emailAddress}
							</FormErrorMessage>
						</FormControl>
						<FormControl
							isInvalid={
								userRegistrationFocusedOnce.password && userRegistrationErrorMessages.password != ''
							}>
							<FormLabel fontSize='14px' bgColor='var(--chakra-colors-gray-800) !important'>
								Password
							</FormLabel>
							<Input
								name='password'
								placeholder='Password'
								type='password'
								onBlur={handleRegistrationInputsFocused}
								onChange={handleRegistrationInputsChange}
							/>
							<FormErrorMessage fontSize='xs'>{userRegistrationErrorMessages.password}</FormErrorMessage>
						</FormControl>
						<FormControl
							isInvalid={
								userRegistrationFocusedOnce.passwordRetype &&
								userRegistrationErrorMessages.passwordRetype != ''
							}>
							<FormLabel fontSize='14px' bgColor='var(--chakra-colors-gray-800) !important'>
								Re-type Password
							</FormLabel>
							<Input
								name='passwordRetype'
								placeholder='Re-type Password'
								type='password'
								onBlur={handleRegistrationInputsFocused}
								onChange={handleRegistrationInputsChange}
							/>
							<FormErrorMessage fontSize='xs'>
								{userRegistrationErrorMessages.passwordRetype}
							</FormErrorMessage>
						</FormControl>
					</Stack>
					<Button
						variant='solid'
						colorScheme='teal'
						w='full'
						onClick={registerNewAccount}
						isLoading={emailRegisteringLoading}>
						Register
					</Button>
					<HStack justify='space-around'>
						<Text fontSize='sm'>Already have an account?</Text>
						<Button variant='link' colorScheme='teal' size='sm' onClick={() => history.push('/')}>
							<Text fontSize='sm'>Sign In</Text>
						</Button>
					</HStack>
					<Button
						bg='#4285F4'
						borderRadius='sm'
						onClick={googleLogin}
						isLoading={googleRegisteringLoading}
						_hover={{
							backgroundColor: '#4274f4',
						}}
						_active={{
							backgroundColor: '#426cf4',
						}}
						leftIcon={<ChakraGoogleDarkButton transform={'translateX(-3px)'} />}
						px='0'
						pr='2'>
						Register with Google
					</Button>
				</Stack>
			</Center>
		);
	},
);

export default Register;
