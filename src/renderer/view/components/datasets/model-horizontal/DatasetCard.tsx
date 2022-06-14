import React, { useEffect } from 'react';

import {
	Box,
	Center,
	Spinner,
	Text,
	HStack,
	Spacer,
	VStack,
	Icon,
	chakra,
	useColorModeValue as mode,
} from '@chakra-ui/react';
import { connect } from 'react-redux';
import ReactTooltip from 'react-tooltip';
import { FiEdit } from 'react-icons/fi';
import { IoTrash } from 'react-icons/io5';
import { push, Push } from 'connected-react-router';

import { Dataset } from '_/renderer/view/helpers/constants/engineTypes';
import Preview from '_utils/images/placeholder-dark2.jpg';
import { InteractiveCopyBadge } from '../../interactive/InteractiveCopyBadge';

import { IAppState } from '_/renderer/state/reducers';
import { openCloseDeleteDatasetAction } from '_/renderer/state/delete-modals/DeleteModalsActions';
import { IOpenCloseDeleteDatasetAction } from '_/renderer/state/delete-modals/model/actionTypes';

import { ISelectedDatasetReducer } from '_/renderer/state/choose-dataset-train/model/reducerTypes';
import {
	changeSelectedDatasetAction,
	resetSelectedDatasetAction,
} from '_/renderer/state/choose-dataset-train/ChooseDatasetActions';
import {
	IChangeSelectedDatasetAction,
	IResetSelectedDatasetAction,
} from '_/renderer/state/choose-dataset-train/model/actionTypes';

import { ENGINE_URL } from '_/renderer/engine-requests/constants';
import { useProgressiveImage } from '_/renderer/view/helpers/hooks/progressiveImage';

interface Props {
	dataset: Dataset;
	selectedDatasetID: ISelectedDatasetReducer;
	changeSelectedDatasetAction: (selectedDatasetID: string) => IChangeSelectedDatasetAction;
	resetSelectedDatasetAction: () => IResetSelectedDatasetAction;
	push: Push;
	openCloseDeleteDataset: (dataset: Dataset) => IOpenCloseDeleteDatasetAction;
}

const DatasetCardC = React.memo((props: Props) => {
	const [imageLoaded, imageSrc] = useProgressiveImage(`${ENGINE_URL}/dataset/${props.dataset.id}/first-image`);
	const cardBG = mode('thia.gray.100', 'thia.gray.800');
	const lastUpdatedColor = mode('thia.gray.300', 'thia.gray.600');

	useEffect(() => {
		return () => {
			props.resetSelectedDatasetAction();
		};
	}, []);
	const renderImage = () => {
		if (!imageLoaded) {
			return (
				<Center h='200px' w='full' borderTopRadius='lg'>
					<Spinner color='gray.600' size='lg' />
				</Center>
			);
		}
		return (
			<chakra.img
				cursor='pointer'
				onClick={() => {
					if (props.selectedDatasetID.value === props.dataset.id) props.resetSelectedDatasetAction();
					else props.changeSelectedDatasetAction(props.dataset.id);
				}}
				borderTopRadius='md'
				objectFit='cover'
				h='200px'
				w='full'
				src={imageSrc}
			/>
		);
	};
	return (
		<>
			<Box
				willChange='box-shadow'
				transition='box-shadow 200ms ease'
				bg={cardBG}
				borderRadius='md'
				w='275px'
				boxShadow={
					props.selectedDatasetID.value === props.dataset.id
						? '0px 0px 8px 3px rgba(56, 178, 172, 0.49)'
						: 'md'
				}
				maxH='lg'>
				{renderImage()}
				<VStack spacing='3' px='3' py='2'>
					<HStack w='full'>
						<Text fontWeight='semibold' maxW='40%' isTruncated>
							{props.dataset.name}
						</Text>
						<Spacer />
						<Box maxW='40%'>
							<InteractiveCopyBadge badgeID={props.dataset.id} />
						</Box>
					</HStack>
					<HStack w='full'>
						<Text fontSize='xs' color={lastUpdatedColor} as='p' maxW='65%'>
							Updated {new Date(props.dataset.date_last_accessed).toDateString()}
						</Text>
						<Spacer />
						<Icon
							data-tip
							data-for='editTooltip'
							cursor='pointer'
							willChange='transform, color'
							transition='all 200ms'
							as={FiEdit}
							outline='none'
							color={mode('thia.gray.700', 'thia.gray.300')}
							onClick={(e) => {
								e.stopPropagation();
								props.push(`/dataset/${props.dataset.id}`);
							}}
							_hover={{ color: mode('thia.purple.400', 'thia.purple.300'), transform: 'scale(1.1)' }}
						/>
						<ReactTooltip
							id='editTooltip'
							className='tooltip'
							delayShow={300}
							place='bottom'
							globalEventOff='mouseout'>
							<Box as='span'>Edit</Box>
						</ReactTooltip>
						<Icon
							data-tip
							data-for='deleteTooltip'
							cursor='pointer'
							willChange='transform'
							transition='all 200ms'
							as={IoTrash}
							transform='scale(1.05)'
							outline='none'
							color='red.400'
							onClick={(e) => {
								e.stopPropagation();

								props.openCloseDeleteDataset(props.dataset);
							}}
							_hover={{ transform: 'scale(1.2)' }}
						/>
						<ReactTooltip
							arrowColor='#f55858'
							id='deleteTooltip'
							className='tooltip red-tooltip'
							delayShow={300}
							place='bottom'
							globalEventOff='mouseout'>
							<Box as='span'>Delete</Box>
						</ReactTooltip>
					</HStack>
				</VStack>
			</Box>
		</>
	);
});

DatasetCardC.displayName = 'DatasetCard';

const mapStateToProps = (state: IAppState) => ({
	selectedDatasetID: state.selectedDataset,
});

/**
 * A dataset card representing a trainable dataset for a model (used once a dataset is fetched).
 */
export const DatasetCard = connect(mapStateToProps, {
	changeSelectedDatasetAction,
	resetSelectedDatasetAction,
	push,
	openCloseDeleteDataset: openCloseDeleteDatasetAction,
})(DatasetCardC);

/**
 * An empty dataset card representing a trainable dataset for a model (used while a dataset is being fetched).
 *
 * @react
 */
export const FillerDatasetCard = () => {
	return (
		<Box
			mx='auto'
			display='flex'
			flexDir='column-reverse'
			textAlign='center'
			borderRadius='md'
			bgImage={Preview}
			bgSize='cover'
			bgPos='center'
			shadow='md'
			w='full'
			h='275px'>
			<Text
				willChange='font-size'
				transition='font-size 200ms ease'
				as='i'
				color='gray.200'
				opacity='0.32'
				fontSize={{ base: '2xl', md: '3xl', lg: '4xl', xl: '5xl', '2xl': '6xl' }}>
				*Cricket Noises*
			</Text>
		</Box>
	);
};
