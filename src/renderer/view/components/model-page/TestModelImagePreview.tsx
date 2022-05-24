import { Button, Center, chakra, Flex, Spinner, Text, useColorModeValue as mode } from '@chakra-ui/react';
import React from 'react';
import { Label } from '../../helpers/constants/engineDBTypes';

interface Props {
	imageSRC: string;
	testedLabel?: string;
	trainedLabel?: Label;
	testRunning: boolean;
}

/**
 * Component for displaying an image when testing a trained model.
 */
export const TestModelImagePreview = React.memo(({ imageSRC, testedLabel, trainedLabel, testRunning }: Props) => {
	const previewBG = mode('thia.gray.100', 'thia.gray.800');
	const borderColor = mode('thia.gray.200', 'thia.gray.600');

	const renderLabel = () => {
		if (testedLabel && trainedLabel) {
			const splitColor = trainedLabel.color.split(/(?:,|\)|\(| )+/);
			const [r, g, b] = [splitColor[1], splitColor[2], splitColor[3]];

			return (
				<Button
					pl='1.5'
					position='relative'
					borderTopRadius='none'
					cursor='default'
					w='full'
					h='35px'
					variant='outline'
					bgColor={`rgba(${r}, ${g}, ${b}, 0.2)`}
					_hover={{
						backgroundColor: `rgba(${r}, ${g}, ${b}, 0.2)`,
					}}
					_active={{
						backgroundColor: `rgba(${r}, ${g}, ${b}, 0.2)`,
					}}
					borderColor={trainedLabel.color}>
					<Text isTruncated>{testedLabel}</Text>
				</Button>
			);
		} else if (testRunning) {
			return (
				<Center
					pl='1.5'
					bg={previewBG}
					position='relative'
					borderTopRadius='none'
					cursor='default'
					w='full'
					h='35px'>
					<Spinner color='gray.600' size='md' />
				</Center>
			);
		}
	};
	return (
		<Flex
			borderRadius='md'
			overflow='hidden'
			flexDir='column'
			bg={previewBG}
			borderWidth='1px'
			borderColor={borderColor}>
			<chakra.img width={200} height={200} objectFit='cover' src={imageSRC} />
			{renderLabel()}
		</Flex>
	);
});

TestModelImagePreview.displayName = 'TestModelImagePreview';
