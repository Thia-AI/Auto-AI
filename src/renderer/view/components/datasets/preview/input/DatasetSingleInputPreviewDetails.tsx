import { Badge, Box, Heading, HStack, Text, VStack, useColorModeValue as mode } from '@chakra-ui/react';
import React from 'react';
import { connect } from 'react-redux';
import {
	IActiveDatasetInputsPreviewIDReducer,
	IActiveDatasetInputsReducer,
} from '_/renderer/state/active-dataset-inputs/model/reducerTypes';
import { IActiveDatasetReducer } from '_/renderer/state/active-dataset-page/model/reducerTypes';
import { IAppState } from '_/renderer/state/reducers';
import { nullInput } from '_/renderer/view/helpers/constants/engineDBTypes';

interface Props {
	activeInputs: IActiveDatasetInputsReducer;
	activeInputPreviewID: IActiveDatasetInputsPreviewIDReducer;
	activeDataset: IActiveDatasetReducer;
}
const DatasetSingleInputPreviewDetailsC = React.memo(({ activeInputPreviewID, activeInputs, activeDataset }: Props) => {
	const activeInput = activeInputs.value[activeInputPreviewID.value] ?? nullInput;
	const detailsBG = mode('thia.gray.150', 'thia.gray.850');
	const borderColor = mode('thia.gray.200', 'thia.gray.700');

	const render = () => {
		if (activeInput.id.length > 0 && activeDataset.value.labels[activeInput.label]) {
			const splitColor = activeDataset.value.labels[activeInput.label].color.split(/(?:,|\)|\(| )+/);
			const r = parseInt(splitColor[1]);
			const g = parseInt(splitColor[2]);
			const b = parseInt(splitColor[3]);
			// TODO: Create chakra ui color scheme closest scheme finder
			return (
				<Box w='full' p='2'>
					<VStack
						borderRadius='md'
						px='2'
						py='3'
						bg={detailsBG}
						borderWidth='1px'
						borderColor={borderColor}
						justifyContent='flex-start'
						alignItems='flex-start'>
						{/* Label */}
						<HStack w='full'>
							<Text fontSize='13px' fontWeight='bold'>
								Label:
							</Text>
							<Badge
								fontSize='xs'
								maxW='70%'
								bgColor={`rgba(${r}, ${g}, ${b}, 0.25)`}
								color={`rgba(${r}, ${g}, ${b}, 1)`}>
								<Text isTruncated fontWeight='normal'>
									{activeInput.label}
								</Text>
							</Badge>
						</HStack>
						{/* File Name */}
						<HStack w='full'>
							<Heading as='h6' size='xs'>
								Name:
							</Heading>
							<Badge
								fontSize='xs'
								maxW='70%'
								variant='subtle'
								colorScheme='thia.gray'
								textTransform='none'>
								<Text isTruncated fontWeight='normal'>
									{activeInput.file_name}
								</Text>
							</Badge>
						</HStack>
						{/* Date Created */}
						<HStack w='full'>
							<Heading as='h6' size='xs'>
								Created:
							</Heading>
							<Badge
								fontSize='xs'
								maxW='70%'
								variant='subtle'
								colorScheme='thia.gray'
								textTransform='none'>
								<Text isTruncated fontWeight='normal'>
									{new Date(activeInput.date_created).toLocaleDateString('en-US', {
										day: 'numeric',
										month: 'long',
										year: 'numeric',
									})}
								</Text>
							</Badge>
						</HStack>
					</VStack>
				</Box>
			);
		}
		return <></>;
	};

	return render();
});

DatasetSingleInputPreviewDetailsC.displayName = 'DatasetSingleInputPreviewDetails';

const mapStateToProps = (state: IAppState) => ({
	activeInputs: state.activeDatasetInputs,
	activeInputPreviewID: state.activeDatasetInputsPreviewID,
	activeDataset: state.activeDataset,
});

/**
 * Details card for the current dataset input being previewed.
 */
export const DatasetSingleInputPreviewDetails = connect(mapStateToProps)(DatasetSingleInputPreviewDetailsC);
