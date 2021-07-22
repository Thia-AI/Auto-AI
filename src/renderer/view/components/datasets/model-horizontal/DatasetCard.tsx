import React, { useState, useEffect, useCallback } from 'react';

import { Box, Center, Spinner, Text, Image, HStack, Spacer, VStack, Icon } from '@chakra-ui/react';
import { connect } from 'react-redux';
import ReactTooltip from 'react-tooltip';
import { FiEdit } from 'react-icons/fi';
import { IoTrash } from 'react-icons/io5';
import { push, Push } from 'connected-react-router';

import { Dataset } from '_view_helpers/constants/engineDBTypes';
import Preview from '_utils/images/placeholder-dark2.jpg';
import NoImage from '_utils/images/placeholder-dark2.jpg';
import { InteractiveCopyBadge } from '../../interactive/InteractiveCopyBadge';

import { IAppState } from '_/renderer/state/reducers';
import { openCloseDeleteDatasetAction } from '_state/delete-dataset/DeleteDatasetActions';
import { IOpenCloseDeleteDatasetAction } from '_/renderer/state/delete-dataset/model/actionTypes';

import { ISelectedDatasetReducer } from '_/renderer/state/choose-dataset-train/model/reducerTypes';
import {
	changeSelectedDatasetAction,
	resetSelectedDatasetAction,
} from '_/renderer/state/choose-dataset-train/ChooseDatasetTrainActions';
import {
	IChangeSelectedDatasetAction,
	IResetSelectedDatasetAction,
} from '_/renderer/state/choose-dataset-train/model/actionTypes';

import './DatasetCard.css';
import { EngineActionHandler } from '_/renderer/engine-requests/engineActionHandler';

interface Props {
	dataset: Dataset;
	selectedDatasetID: ISelectedDatasetReducer;
	changeSelectedDatasetAction: (selectedDatasetID: string) => IChangeSelectedDatasetAction;
	resetSelectedDatasetAction: () => IResetSelectedDatasetAction;
	push: Push;
	openCloseDeleteDataset: (dataset: Dataset) => IOpenCloseDeleteDatasetAction;
}

const DatasetCardC = React.memo((props: Props) => {
	// Dataset
	const [datasetImage, setDatasetImage] = useState('');
	const [imageRetrived, setImageRetrieved] = useState(false);

	const fetchFirstImage = useCallback(async () => {
		const [error, resData] = await EngineActionHandler.getInstance().getFirstImageOfDataset(
			props.dataset.id,
		);

		setImageRetrieved(true);
		if (!error && resData['image']) {
			setDatasetImage(resData['image']);
		}
	}, [props.dataset.id]);
	useEffect(() => {
		fetchFirstImage();
	}, []);

	const renderImage = () => {
		if (!imageRetrived) {
			return (
				<Center h='200px' w='full' borderTopRadius='lg'>
					<Spinner color='gray.600' size='lg' />
				</Center>
			);
		}
		return (
			<Image
				cursor='pointer'
				onClick={() => {
					if (props.selectedDatasetID.value === props.dataset.id)
						props.resetSelectedDatasetAction();
					else props.changeSelectedDatasetAction(props.dataset.id);
				}}
				borderTopRadius='lg'
				fit='cover'
				h='200px'
				w='full'
				src={datasetImage}
				fallbackSrc={NoImage}
			/>
		);
	};
	return (
		<>
			<Box
				willChange='box-shadow'
				transition='box-shadow 200ms ease'
				bg='gray.750'
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
						<Text fontSize='xs' color='gray.600' as='p' maxW='65%'>
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
							color='gray.300'
							onClick={(e) => {
								e.stopPropagation();

								props.push(`/dataset/${props.dataset.id}`);
							}}
							_hover={{ color: 'teal.500', transform: 'scale(1.1)' }}
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
const mapStateToProps = (state: IAppState) => ({
	selectedDatasetID: state.selectedDataset,
});

export const DatasetCard = connect(mapStateToProps, {
	changeSelectedDatasetAction,
	resetSelectedDatasetAction,
	push,
	openCloseDeleteDataset: openCloseDeleteDatasetAction,
})(DatasetCardC);

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
			boxShadow='md'
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
