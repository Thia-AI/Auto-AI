import React from 'react';
import {
	HStack,
	Text,
	Badge,
	Spacer,
	VStack,
	Skeleton,
	ThemingProps,
	useColorModeValue as mode,
	Box,
	Heading,
	useBreakpointValue,
} from '@chakra-ui/react';

import { getVerboseModelType } from '_view_helpers/modelHelper';

import ImageClassificationPreview from '_utils/images/image_classification_card_bg.jpg';
import './ModelCard.css';
import { InteractiveCopyBadge } from '../interactive/InteractiveCopyBadge';
import { Model, ModelStatus } from '../../helpers/constants/engineTypes';

interface Props {
	isLoaded: boolean;
	model: Model;
	onClick: () => void;
}

/**
 * Card representing a model in the
 */
export const ModelCard = React.memo(({ model, onClick, isLoaded }: Props) => {
	const modelCardBG = mode('thia.gray.50', 'thia.gray.700');
	const borderColor = mode('thia.gray.200', 'thia.gray.600');
	const modelDetailsTextColor = mode('thia.gray.400', 'thia.gray.300');
	const modelDateCreatedColor = mode('thia.gray.200', 'thia.gray.400');

	const cardWidth = useBreakpointValue({ base: '90%', lg: '80%', xl: '75%' });
	const modelDetailsHStackSpacing = useBreakpointValue({ base: '6', lg: '10', xl: '14' });
	const modelDetailsHeadingFontSize = useBreakpointValue({ base: 'xs', xl: 'sm' });
	const modelDetailsTextFontSize = useBreakpointValue({ base: 'xs', xl: 'sm' });

	const statusColor = (): ThemingProps['colorScheme'] => {
		switch (model.model_status) {
			case ModelStatus.IDLE:
				return 'thia.gray';
			case ModelStatus.TRAINED:
				return 'thia.purple';
			case ModelStatus.TRAINING:
			case ModelStatus.STARTING_TRAINING:
				return 'green';
			case ModelStatus.ERROR:
				return 'red';
			default:
				return 'gray';
		}
	};

	const modelTypeExtraToVerbose = (modelTypeExtra: string) => {
		return modelTypeExtra.replace('-', ' ');
	};

	return (
		<HStack
			willChange='transform'
			cursor='pointer'
			onClick={onClick}
			_hover={{
				transform: `${isLoaded ? 'scale(1.01)' : ''}`,
			}}
			transition={isLoaded ? 'all 250ms' : ''}
			w={cardWidth}
			h='150px'
			borderColor={borderColor}
			borderWidth='1px'
			borderRadius='lg'
			boxShadow='lg'
			bg={modelCardBG}>
			<Skeleton w='150px' h='full' isLoaded={isLoaded}>
				<Box bgImage={ImageClassificationPreview} bgSize='cover' bgPos='center' w='full' h='full' />
			</Skeleton>

			<Skeleton
				pt='2'
				pb='1'
				px='4'
				w='full'
				h='full'
				isLoaded={isLoaded}
				borderRightRadius='lg'
				borderLeftRadius='none'>
				<VStack bgPos='center' bgSize='cover' borderRadius='lg' w='full' h='full'>
					<HStack pb='4' w='full'>
						<Badge ml='2' colorScheme='thia.gray'>
							<Heading fontSize='md'>{modelTypeExtraToVerbose(model.model_type_extra)}</Heading>
						</Badge>
						<Badge ml='2' colorScheme='purple'>
							<Heading fontSize='md'>{getVerboseModelType(model.model_type)}</Heading>
						</Badge>

						<Spacer />
						<InteractiveCopyBadge badgeID={model.id} fontSize='0.725rem' />
					</HStack>
					<HStack spacing={modelDetailsHStackSpacing} w='full' justify='flex-start'>
						<Heading fontSize={modelDetailsHeadingFontSize} transition='font-size 150ms ease'>
							Name:
						</Heading>
						<Text
							fontSize={modelDetailsTextFontSize}
							transition='font-size 150ms ease'
							color={modelDetailsTextColor}
							noOfLines={1}>
							{model.model_name}
						</Text>
					</HStack>
					<HStack spacing={modelDetailsHStackSpacing} w='full' justify='flex-start'>
						<Heading fontSize={modelDetailsHeadingFontSize} transition='font-size 150ms ease'>
							Status:
						</Heading>
						<Badge
							colorScheme={statusColor()}
							fontSize={modelDetailsTextFontSize}
							transition='font-size 150ms ease'
							maxW='60%'>
							<Text noOfLines={1}>{model.model_status}</Text>
						</Badge>
					</HStack>

					<Spacer />
					<HStack px='2' h='full' w='full' justifyContent='flex-end' alignItems='flex-end'>
						<Text mb='1' color={modelDateCreatedColor} fontSize='xs'>
							Created on {new Date(model.date_created).toDateString()}
						</Text>
					</HStack>
				</VStack>
			</Skeleton>
		</HStack>
	);
});

ModelCard.displayName = 'ModelCard';
