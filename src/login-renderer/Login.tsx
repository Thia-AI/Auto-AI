import React, { useEffect, useState } from 'react';
import { AuthProvider, useAuth, useFirebaseApp } from 'reactfire';
import { auth as UIAuth } from 'firebaseui';
import { getRedirectResult, GoogleAuthProvider, signInWithRedirect } from 'firebase/auth';
import {
	Box,
	Button,
	Center,
	chakra,
	Heading,
	Icon,
	Stack,
	useBreakpointValue,
	VStack,
	Text,
	HTMLChakraProps,
	Input,
	FormControl,
	FormErrorMessage,
	FormHelperText,
	FormLabel,
	HStack,
	Checkbox,
} from '@chakra-ui/react';
import { FaGoogle } from 'react-icons/fa';
import { io } from 'socket.io-client';
import axios from 'axios';
import { LOGIN_WINDOW_LOGIN_WORKFLOW_COMPLETE } from '_/shared/ipcChannels';
import GoogleDarkButton from '_utils/svgs/google-button-svgs/btn_google_dark_normal_ios.svg';
import thiaIcon from '_public/icon.png';

const webAppConfig = {
	port: '8443',
	hostPort: 'localhost:8443',
	hostUrl: 'https://localhost:8443',
};

const ChakraGoogleDarkButton = chakra(GoogleDarkButton);

export const Login = React.memo(() => {
	const auth = useAuth();
	const provider = new GoogleAuthProvider();
	const [signInLoading, setSignInLoading] = useState(false);
	provider.setCustomParameters({
		prompt: 'select_account consent',
	});
	const googleLogin = async () => {
		await signInWithRedirect(auth, provider);
	};
	useEffect(() => {
		getOAuthResponse();
	}, []);

	useEffect(() => {
		const socket = io(webAppConfig.hostUrl);
		socket.on(LOGIN_WINDOW_LOGIN_WORKFLOW_COMPLETE, () => {
			// Loaded
			setSignInLoading(false);
		});
		return () => {
			socket.disconnect();
		};
	}, []);

	const getOAuthResponse = async () => {
		const result = await getRedirectResult(auth);
		if (result) {
			setSignInLoading(true);
			const credential = GoogleAuthProvider.credentialFromResult(result);
			// Send that result to backend to create custom token
			await axios.post('https://localhost:8443/api/loginToken', {
				uid: result.user.uid,
			});
		}
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
					<FormControl variant='floating' isRequired>
						<Input id='email' placeholder=' ' type='email' />
						<FormLabel bgColor='var(--chakra-colors-gray-800) !important'>Email Address</FormLabel>
						<FormErrorMessage>Your First name is invalid</FormErrorMessage>
					</FormControl>
					<FormControl variant='floating' isRequired>
						<Input id='password' placeholder=' ' type='password' />
						<FormLabel bgColor='var(--chakra-colors-gray-800) !important'>Password</FormLabel>
						<FormErrorMessage>Your First name is invalid</FormErrorMessage>
					</FormControl>
				</VStack>
				<HStack justify='space-between' w='full' align='baseline'>
					<Checkbox defaultIsChecked size='sm'>
						<Text fontSize='sm'>Remember me</Text>
					</Checkbox>
					<Button variant='link' colorScheme='teal' size='sm'>
						<Text fontSize='sm'>Forgot password</Text>
					</Button>
				</HStack>
				<Button variant='solid' colorScheme='teal' w='full'>
					Sign in
				</Button>
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
