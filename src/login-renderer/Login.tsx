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
} from '@chakra-ui/react';
import { useHistory } from 'react-router-dom';
import GoogleDarkButton from '_utils/svgs/google-button-svgs/btn_google_dark_normal_ios.svg';
import thiaIcon from '_public/icon.png';

const webAppConfig = {
	port: '8443',
	hostPort: 'localhost:8443',
	hostUrl: 'https://localhost:8443',
};

const ChakraGoogleDarkButton = chakra(GoogleDarkButton);

interface Props {
	setSignInLoading: (signInStatus: boolean) => void;
	signInLoading: boolean;
}
const Login = React.memo(({ signInLoading, setSignInLoading }: Props) => {
	const auth = useAuth();
	const provider = new GoogleAuthProvider();
	const history = useHistory();

	provider.setCustomParameters({
		prompt: 'select_account consent',
	});
	const googleLogin = async () => {
		await signInWithRedirect(auth, provider);
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
						<Input placeholder=' ' type='email' />
						<FormLabel bgColor='var(--chakra-colors-gray-800) !important'>Email Address</FormLabel>
						<FormErrorMessage>Email is invalid</FormErrorMessage>
					</FormControl>
					<FormControl variant='floating' isRequired>
						<Input placeholder=' ' type='password' />
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
