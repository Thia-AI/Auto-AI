import { Box, Text, useMediaQuery, chakra, Wrap, Icon, Heading, ChakraComponent } from '@chakra-ui/react';
import React from 'react';
import { Model } from '../../helpers/constants/engineDBTypes';
import TensorFlowLogo from '_utils/images/TensorFlow Brand Assets/TensorFlow Logo/Primary/SVG/FullColorPrimary Icon.svg';

interface Props {
	model: Model;
}

const CharkaTensorFlowLogo = chakra(TensorFlowLogo);

/**
 * Section in model page for exporting the model.
 */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export const ExportModel = React.memo(({ model }: Props) => {
	const [isLargerThan1280] = useMediaQuery('(min-width: 1280px)');

	return (
		<Box
			w={isLargerThan1280 ? '90%' : 'full'}
			py='6'
			willChange='width'
			transition='width 200ms'
			alignSelf='center'
			px='8'
			rounded='lg'
			bg='gray.700'
			shadow='base'>
			<Box mb='8' w='full'>
				<Text as='h3' fontWeight='bold' fontSize='lg'>
					Export
				</Text>
				<Text color='gray.500' fontSize='sm'>
					Export your model in the format you need.
				</Text>
			</Box>
			<Wrap
				mt='4'
				spacing='4'
				shouldWrapChildren
				justify='space-evenly'
				direction={{ base: 'column', md: 'row' }}>
				<ExtraModelTypeButton
					iconSrc={CharkaTensorFlowLogo}
					title='TF SavedModel'
					description='Export your model in a TF SavedModel format to run your model on desktop devices or docker container.'
				/>
				<ExtraModelTypeButton
					iconSrc={CharkaTensorFlowLogo}
					title='TF Lite'
					description='Export your model in a TF Lite format to run your model on the edge or mobile devices.'
				/>
				<ExtraModelTypeButton
					iconSrc={CharkaTensorFlowLogo}
					title='TensorFlow.js'
					description='Export your model in a TensorFlow.js format to run your model on the browser or Node.js.'
				/>
			</Wrap>
		</Box>
	);
});

ExportModel.displayName = 'ExportModel';

interface ExtraModelTypeButton {
	title: string;
	description: string;
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	iconSrc: ChakraComponent<any, {}>;
}

const ExtraModelTypeButton = React.memo(({ title, description, iconSrc }: ExtraModelTypeButton) => {
	return (
		<Box
			px='4'
			py='4'
			pt='1'
			bg='gray.750'
			rounded='sm'
			cursor='pointer'
			willChange='transform'
			transition='all 200ms ease'
			_hover={{
				transform: 'scale(1.03)',
			}}>
			<Icon as={iconSrc} w={12} h={12} />
			<Heading as='h6' size='sm'>
				{title}
			</Heading>
			<Text mt='1' fontSize='13px' color='gray.400' fontWeight='thin' as='p' maxW='250px' textAlign='left'>
				{description}
			</Text>
		</Box>
	);
});

ExtraModelTypeButton.displayName = 'ExtraModelTypeButton';
