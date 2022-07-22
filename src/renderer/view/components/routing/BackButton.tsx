import { chakra, IconButton } from '@chakra-ui/react';
import React from 'react';
import { TbArrowBackUp } from 'react-icons/tb';
import { useNavigate } from 'react-router';

/**
 * Back button.
 */
export const BackButton = React.memo(() => {
	const navigate = useNavigate();
	return (
		<chakra.a onClick={() => navigate(-1)}>
			<IconButton
				aria-label='Go Back'
				title='Go Back'
				icon={<TbArrowBackUp />}
				variant='ghost'
				colorScheme='thia.gray'
			/>
		</chakra.a>
	);
});

BackButton.displayName = 'BackButton';
