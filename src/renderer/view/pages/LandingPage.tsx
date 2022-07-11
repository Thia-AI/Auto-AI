import React, { useEffect } from 'react';

import { Box, Button, Center, Heading, chakra, Flex } from '@chakra-ui/react';
import { useAuth } from 'reactfire';
import { signInWithCustomToken, setPersistence } from 'firebase/auth';
import { ipcRenderer } from 'electron';
import { IPC_SEND_AUTH_CREDENTIAL_TO_MAIN_RENDERER, IPC_SHOW_LOGIN_WINDOW } from '_/shared/ipcChannels';
import { persistenceMap, PERSISTENCE_TYPE } from '_/shared/appConstants';

import { motion } from 'framer-motion';

const variants = {
	initial: { opacity: 0, width: '40%', height: '40%' },
	animate: {
		opacity: 0.2,
		width: '50%',
		height: '70%',
		transition: { delay: 0.5, duration: 1.5 },
	},
};

import { toast } from '../helpers/functionHelpers';

/**
 * Login page.
 *
 * @react
 */
const LandingPage = () => {
	const auth = useAuth();

	const showLoginWindow = async () => {
		await ipcRenderer.invoke(IPC_SHOW_LOGIN_WINDOW);
	};

	useEffect(() => {
		// Issue of being called multiple times when signing out and singing on multiple times resulting in
		// multiple toast notifications being sent
		ipcRenderer.once(
			IPC_SEND_AUTH_CREDENTIAL_TO_MAIN_RENDERER,
			(event, customToken: string, persistence: PERSISTENCE_TYPE) => {
				setPersistence(auth, persistenceMap[persistence])
					.then(() => {
						signInWithCustomToken(auth, customToken)
							.then((userCredential) => {
								toast({
									title: 'Login Successful',
									description: `Welcome ${userCredential.user.displayName}`,
									status: 'success',
									duration: 1500,
									isClosable: false,
									uid: userCredential.user.uid,
									reInitStore: true,
									saveToStore: false,
								});
							})
							.catch((error) => {
								console.log(error);
								// TODO: Handle error
							});
					})
					.catch((error) => {
						console.log(error);
					});
			},
		);
	}, []);
	return (
		<Box w='100%' m='auto' pos='relative'>
			<Box
				as={motion.div}
				top='50%'
				left='50%'
				bg='white'
				pos='absolute'
				filter='blur(120px)'
				initial='initial'
				animate='animate'
				variants={variants}
				transform='translate(-50%, -50%)'
				backgroundImage='linear-gradient(90deg, rgba(71,0,255,1) 0%, rgba(119,66,255,1) 100%)'
			/>
			<motion.div
				initial={{ opacity: 0, scale: 0.95, y: '2%' }}
				animate={{ opacity: 1, scale: 1, y: '0%' }}
				transition={{ transition: 'ease', duration: 1 }}>
				<Box overflowX='hidden' overflowY='hidden'>
					<Flex pt={12} px={{ base: 0, xl: 20 }} flexDir='column' justify='space-evenly' align='center'>
						<Heading px={10} fontSize={{ base: '3xl', md: '5xl' }} lineHeight='shorter' textAlign='center'>
							AutoML ran within your ecosystem
						</Heading>

						<Box display='block' rounded='xl'>
							<Center w='full' h='full' pb='20px'>
								<chakra.img
									src='../public/app_screenshot.jpg'
									borderRadius='md'
									alt='App Screenshot'
									width={{ base: '80%', xl: '75%' }}
								/>
							</Center>
						</Box>
						<Button mt='3' colorScheme='thia.purple' onClick={showLoginWindow}>
							Get Started
						</Button>
					</Flex>
				</Box>
			</motion.div>
		</Box>
	);
};

export default LandingPage;
