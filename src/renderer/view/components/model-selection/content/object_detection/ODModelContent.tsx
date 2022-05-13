import { Heading, VStack } from '@chakra-ui/react';
import React from 'react';

/**
 * Object detection model content description.
 *
 * @react
 */
export const ODModelContent = () => {
	return (
		<VStack w='full' alignItems='flex-start'>
			<Heading>
				Coming soon to an AutoML near you{' '}
				{/* 
					Seperate text needed with normal font weight 
					See bug in chrome 96: https://bugs.chromium.org/p/chromium/issues/detail?id=1266022&q=emoji&can=1
				*/}
				<Heading display='inline' fontWeight='normal'>
					😉
				</Heading>
				...
			</Heading>
		</VStack>
	);
};
