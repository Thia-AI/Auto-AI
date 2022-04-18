import React, { useEffect, useState } from 'react';
import { AuthProvider, useAuth, useFirebaseApp } from 'reactfire';
import { auth as UIAuth } from 'firebaseui';
import {
	getRedirectResult,
	GoogleAuthProvider,
	signInWithRedirect,
	signInWithEmailAndPassword,
	sendEmailVerification,
	AuthError,
	AuthErrorCodes,
} from 'firebase/auth';
import {
	Box,
	Button,
	Center,
	chakra,
	Heading,
	Stack,
	useBreakpointValue,
	VStack,
	Text,
	Input,
	FormControl,
	FormErrorMessage,
	FormLabel,
	HStack,
	Checkbox,
	useToast,
} from '@chakra-ui/react';
import { useHistory } from 'react-router-dom';
import GoogleDarkButton from '_utils/svgs/google-button-svgs/btn_google_dark_normal_ios.svg';
import thiaIcon from '_public/icon.png';
import { FirebaseError } from 'firebase/app';
import { PERSISTENCE_TYPE } from '_/shared/appConstants';

const ChakraGoogleDarkButton = chakra(GoogleDarkButton);

interface Props {
	setSignInLoading: (signInStatus: boolean) => void;
	signInLoading: boolean;
	postLoginToken: (uid: string, persistence: PERSISTENCE_TYPE) => Promise<void>;
}
const Login = React.memo(({ signInLoading, setSignInLoading, postLoginToken }: Props) => {
	const auth = useAuth();
	const provider = new GoogleAuthProvider();
	const history = useHistory();
	const toast = useToast();

	const [rememberMe, setRememberMe] = useState(true);

	const [emailAddress, setEmailAddress] = useState('');
	const [password, setPassword] = useState('');

	const [emailErrorMessage, setEmailErrorMessage] = useState('');
	const [passwordErrorMessage, setPasswordErrorMessage] = useState('');

	const [emailFocusedOnce, setEmailFocusedOnce] = useState(false);
	const [passwordFocusedOnce, setPasswordFocusedOnce] = useState(false);

	provider.setCustomParameters({
		prompt: 'select_account consent',
	});
	const googleLogin = async () => {
		await signInWithRedirect(auth, provider);
	};

	const resendEmailVerification = () => {
		if (password.trim() == '' || emailAddress.trim() == '') {
			toast({
				title: 'Error',
				description: 'Please enter an email',
				status: 'error',
				duration: 1500,
				isClosable: false,
			});
			return;
		}
		// Email address input handling
		const emailAddressPattern =
			/^(([^<>()[\]\.,;:\s@\"]+(\.[^<>()[\]\.,;:\s@\"]+)*)|(\".+\"))@(([^<>()[\]\.,;:\s@\"]+\.)+[^<>()[\]\.,;:\s@\"]{2,})$/i;
		if (!emailAddress.match(emailAddressPattern)) {
			toast({
				title: 'Error',
				description: 'Invalid email',
				status: 'error',
				duration: 1500,
				isClosable: false,
			});
			return;
		}

		signInWithEmailAndPassword(auth, emailAddress, password)
			.then(async (userCredential) => {
				if (userCredential.user.emailVerified) {
					// User is already verified
					toast({
						title: 'Info',
						description: 'Email is already verified',
						status: 'info',
						duration: 1500,
						isClosable: false,
					});
				} else {
					await sendEmailVerification(userCredential.user);
					toast({
						title: 'Info',
						description: 'Email verification sent, check your email',
						status: 'info',
						duration: 1500,
						isClosable: false,
					});
				}
			})
			.catch((error: FirebaseError) => {
				const errorCode = error.code;
				const errorMessage = error.message;

				if (
					errorCode == AuthErrorCodes.INVALID_PASSWORD ||
					errorCode == AuthErrorCodes.USER_DELETED ||
					errorCode == AuthErrorCodes.INTERNAL_ERROR
				) {
					toast({
						title: 'Error',
						description: 'Invalid email or password',
						status: 'error',
						duration: 1500,
						isClosable: false,
					});
					setSignInLoading(false);
				} else if (errorCode == AuthErrorCodes.INVALID_EMAIL) {
					toast({
						title: 'Error',
						description: 'Invalid email',
						status: 'error',
						duration: 1500,
						isClosable: false,
					});
					setSignInLoading(false);
				}
			});
	};

	const emailLogin = async () => {
		if (password.trim() == '' || emailAddress.trim() == '') {
			toast({
				title: 'Error',
				description: 'Login form not filled out',
				status: 'error',
				duration: 1500,
				isClosable: false,
			});
			return;
		}
		// Email address input handling
		const emailAddressPattern =
			/^(([^<>()[\]\.,;:\s@\"]+(\.[^<>()[\]\.,;:\s@\"]+)*)|(\".+\"))@(([^<>()[\]\.,;:\s@\"]+\.)+[^<>()[\]\.,;:\s@\"]{2,})$/i;
		if (!emailAddress.match(emailAddressPattern)) {
			toast({
				title: 'Error',
				description: 'Invalid email',
				status: 'error',
				duration: 1500,
				isClosable: false,
			});
			return;
		}
		setSignInLoading(true);
		signInWithEmailAndPassword(auth, emailAddress, password)
			.then(async (userCredential) => {
				if (!userCredential.user.emailVerified) {
					setPassword('');
					toast({
						title: 'Info',
						description: 'Email not verified, check your email',
						status: 'info',
						duration: 1500,
						isClosable: false,
					});
					setSignInLoading(false);
				} else {
					setPassword('');
					setEmailAddress('');
					let persistence: PERSISTENCE_TYPE = 'local';
					if (!rememberMe) {
						persistence = 'session';
					}
					await postLoginToken(userCredential.user.uid, persistence);
				}
			})
			.catch((error: FirebaseError) => {
				const errorCode = error.code;
				const errorMessage = error.message;

				if (
					errorCode == AuthErrorCodes.INVALID_PASSWORD ||
					errorCode == AuthErrorCodes.USER_DELETED ||
					errorCode == AuthErrorCodes.INTERNAL_ERROR
				) {
					toast({
						title: 'Error',
						description: 'Invalid email or password',
						status: 'error',
						duration: 1500,
						isClosable: false,
					});
					setSignInLoading(false);
				} else if (errorCode == AuthErrorCodes.INVALID_EMAIL) {
					toast({
						title: 'Error',
						description: 'Invalid email',
						status: 'error',
						duration: 1500,
						isClosable: false,
					});
					setSignInLoading(false);
				}
			});
	};

	return (
		<Center w='full' h='full'>
			<VStack spacing='5' w={{ base: '65%', sm: '67%', md: '70%' }}>
				<Box w='full'>
					<Center>
						<chakra.img src={thiaIcon} width='60px' h='60px' />
					</Center>
					<Stack spacing={{ base: '2', md: '3' }} textAlign='center'>
						<Heading size={useBreakpointValue({ base: 'md', md: 'lg' })}>Log in to your account</Heading>
						<Text fontSize={useBreakpointValue({ base: '14px', md: '16px' })} color='gray.300'>
							Start training on your hardware
						</Text>
					</Stack>
				</Box>
				<VStack spacing='3' w='full'>
					<FormControl variant='floating' isRequired isInvalid={emailFocusedOnce && emailErrorMessage != ''}>
						<Input
							placeholder=' '
							type='email'
							value={emailAddress}
							onBlur={() => setEmailFocusedOnce(true)}
							onChange={(e) => {
								const val = e.target.value;
								// Email address input handling
								const emailAddressPattern =
									/^(([^<>()[\]\.,;:\s@\"]+(\.[^<>()[\]\.,;:\s@\"]+)*)|(\".+\"))@(([^<>()[\]\.,;:\s@\"]+\.)+[^<>()[\]\.,;:\s@\"]{2,})$/i;
								if (!val.match(emailAddressPattern)) {
									// Invalid email address pattern
									setEmailErrorMessage('Invalid email address');
								} else setEmailErrorMessage('');
								setEmailAddress(val);
							}}
						/>
						<FormLabel bgColor='var(--chakra-colors-gray-800) !important'>Email Address</FormLabel>
						<FormErrorMessage>{emailErrorMessage}</FormErrorMessage>
					</FormControl>
					<FormControl
						variant='floating'
						isRequired
						isInvalid={passwordFocusedOnce && passwordErrorMessage != ''}>
						<Input
							placeholder=' '
							value={password}
							onBlur={() => setPasswordFocusedOnce(true)}
							onChange={(e) => {
								const val = e.target.value;
								if (val.trim().length == 0) {
									setPasswordErrorMessage('Enter a password');
								} else {
									setPasswordErrorMessage('');
								}
								setPassword(val);
							}}
							type='password'
						/>
						<FormLabel bgColor='var(--chakra-colors-gray-800) !important'>Password</FormLabel>
						<FormErrorMessage>{passwordErrorMessage}</FormErrorMessage>
					</FormControl>
				</VStack>
				<HStack justify='space-between' w='full' align='baseline'>
					<Checkbox isChecked={rememberMe} size='sm' onChange={(e) => setRememberMe(e.target.checked)}>
						<Text fontSize='sm'>Remember me</Text>
					</Checkbox>
					<Button variant='link' colorScheme='teal' size='sm'>
						<Text fontSize='sm'>Forgot password</Text>
					</Button>
				</HStack>
				<Button variant='solid' colorScheme='teal' w='full' onClick={emailLogin}>
					Sign in
				</Button>
				<Button variant='outline' colorScheme='gray' w='full' onClick={resendEmailVerification}>
					Resend Email Verification
				</Button>
				<HStack justify='space-around'>
					<Text fontSize='sm'>New to Thia?</Text>
					<Button variant='link' colorScheme='teal' size='sm' onClick={() => history.push('/register')}>
						<Text fontSize='sm'>Sign up</Text>
					</Button>
				</HStack>
				<Button
					bg='#4285F4'
					borderRadius='sm'
					onClick={googleLogin}
					isLoading={signInLoading}
					_hover={{
						backgroundColor: '#4274f4',
					}}
					_active={{
						backgroundColor: '#426cf4',
					}}
					leftIcon={<ChakraGoogleDarkButton transform={'translateX(-3px)'} />}
					px='0'
					pr='2'>
					Sign in with Google
				</Button>
			</VStack>
		</Center>
	);
});

export default Login;
