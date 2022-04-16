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
} from '@chakra-ui/react';
import axios from 'axios';
import { GoogleAuthProvider, signInWithRedirect, getRedirectResult } from 'firebase/auth';
import React, { useEffect, useState } from 'react';
import { useHistory } from 'react-router';
import { useAuth } from 'reactfire';

import GoogleDarkButton from '_utils/svgs/google-button-svgs/btn_google_dark_normal_ios.svg';

const ChakraGoogleDarkButton = chakra(GoogleDarkButton);

interface Props {
	setRegisterLoading: (signInStatus: boolean) => void;
	registerLoading: boolean;
}
const Register = React.memo(({ setRegisterLoading, registerLoading }: Props) => {
	const auth = useAuth();
	const provider = new GoogleAuthProvider();
	const history = useHistory();

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

	useEffect(() => {
		getOAuthResponse();
	}, []);

	const getOAuthResponse = async () => {
		const result = await getRedirectResult(auth);
		if (result) {
			setRegisterLoading(true);
			const credential = GoogleAuthProvider.credentialFromResult(result);
			// Send that result to backend to create custom token
			await axios.post('https://localhost:8443/api/loginToken', {
				uid: result.user.uid,
			});
		}
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
				const passwordPattern = /(?=.*[0-9]+)(?=.*[a-z]+)(?=.*[A-Z]+).{6,}/;
				if (!val.match(passwordPattern)) {
					setUserRegistrationErrorMessages({
						...userRegistrationErrorMessages,
						password: 'Weak password',
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

	const registerNewAccount = () => {
		// TODO: Validate user registration details first
		// TODO: Create new user and update their user profile with the display name.
		// See:
		// https://stackoverflow.com/questions/37413111/adding-the-displayname-whilst-using-createuserwithemailandpassword
		// https://firebase.google.com/docs/auth/web/manage-users#update_a_users_profile
		// https://firebase.google.com/docs/reference/js/auth.md#updateprofile
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
							userRegistrationFocusedOnce.emailAddress && userRegistrationErrorMessages.emailAddress != ''
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
						<FormErrorMessage fontSize='xs'>{userRegistrationErrorMessages.emailAddress}</FormErrorMessage>
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
				<Button variant='solid' colorScheme='teal' w='full' onClick={registerNewAccount}>
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
					isLoading={registerLoading}
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
});

export default Register;
