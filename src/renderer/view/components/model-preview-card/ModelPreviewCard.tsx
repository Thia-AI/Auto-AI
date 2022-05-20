import React from 'react';
import { Box, Divider, Flex, Badge, chakra, Text, useColorModeValue as mode } from '@chakra-ui/react';
import { connect } from 'react-redux';
import LazyLoad from 'react-lazyload';

import { changeSelectedModelAction } from '_renderer/state/choose-model/ChooseModelActions';

import './ModelPreviewCard.css';
import { IChangeSelectedModelAction } from '_/renderer/state/choose-model/model/actionTypes';

interface Props {
	imageSrc: string;
	badge: string;
	badgeColorScheme: string;
	cardTitle: string;
	cardDescription: string;
	updatedDate: string;
	selectedModelNumber: number;
	changeSelectedModelAction: (modelNumber: number) => IChangeSelectedModelAction;
}

const ModelPreviewCardC = React.memo((props: Props) => {
	return (
		<Box
			boxShadow='lg'
			minW='275px'
			w='275px'
			maxH='290px'
			// borderWidth='1px'
			borderTopWidth='1px'
			borderRadius='lg'
			overflow='hidden'
			cursor='pointer'
			onClick={() => props.changeSelectedModelAction(props.selectedModelNumber)}>
			<LazyLoad>
				<chakra.img
					src={props.imageSrc}
					alt='Image'
					width='275px'
					height='175px'
					objectFit='cover'
					borderTopRadius='lg'
					borderColor='gray.900'
				/>
			</LazyLoad>

			<Divider w='full' />
			<Box pt='6' pb='4' px='6'>
				<Flex align='baseline' justify='center'>
					<Badge borderRadius='full' px='2' colorScheme={props.badgeColorScheme}>
						{props.badge}
					</Badge>
					<Text
						flexGrow={2}
						color={mode('thia.purple.400', 'thia.purple.350')}
						fontWeight='semibold'
						letterSpacing='wide'
						fontSize='xs'
						textTransform='uppercase'
						ml='2'>
						{props.cardTitle}
					</Text>
				</Flex>
				<Box mt='1' fontWeight='medium' as='h5' lineHeight='tight' isTruncated fontSize='md'>
					{props.cardDescription}
				</Box>
				<Box as='p' mt='2' color={mode('thia.gray.700', 'thia.gray.400')} fontSize='xs'>
					Updated {props.updatedDate}
				</Box>
			</Box>
		</Box>
	);
});

ModelPreviewCardC.displayName = 'ModelPreviewCard';

/**
 * Card for previewing of models when creating new model.
 */
export const ModelPreviewCard = connect(null, { changeSelectedModelAction })(ModelPreviewCardC);
