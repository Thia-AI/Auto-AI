import React from 'react';

import { Text, SlideFade, Badge, Box } from '@chakra-ui/react';
import { IoIosInformationCircle } from 'react-icons/io';
interface Props {
	isInputValid: boolean;
	inputError: string;
	clickedOnInputOnce: boolean;
	isInputFocused: boolean;
}

/**
 * Displays error text for inputs.
 */
export const InputErrorText = React.memo(
	({ isInputValid, inputError, clickedOnInputOnce, isInputFocused }: Props) => {
		return (
			<Box h='fit-content' px='1' w='full' pb='1.5'>
				<SlideFade
					unmountOnExit={true}
					offsetY='5px'
					in={!isInputValid && clickedOnInputOnce && isInputFocused}>
					<Badge
						display='flex'
						alignItems='center'
						borderRadius='md'
						flexDir='row'
						fontSize='xs'
						w='full'
						colorScheme='red'>
						<Box mr='1'>
							<IoIosInformationCircle />
						</Box>
						<Text isTruncated>{inputError}</Text>
					</Badge>
				</SlideFade>
			</Box>
		);
	},
);
