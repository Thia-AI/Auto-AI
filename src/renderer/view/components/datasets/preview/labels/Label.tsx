import React from 'react';

import { Center, Flex, Icon, Spacer, Text } from '@chakra-ui/react';
import { Draggable, DraggableProvided } from 'react-beautiful-dnd';
import { IoTrash } from 'react-icons/io5';
import { connect } from 'react-redux';
import { LabelsList as _LabelsList } from './LabelsList';
import { openCloseDeleteLabelAction } from '_/renderer/state/delete-modals/DeleteModalsActions';
import { IOpenCloseDeleteLabelAction } from '_/renderer/state/delete-modals/model/actionTypes';

interface Props {
	label: string;
	index: number;
	openCloseDeleteLabel: (labelValue: string) => IOpenCloseDeleteLabelAction;
}

const LabelC = React.memo(({ label, index, openCloseDeleteLabel }: Props) => {
	const renderLabelWrapped = (provided: DraggableProvided) => (
		<Flex
			{...provided.draggableProps}
			{...provided.dragHandleProps}
			w='full'
			py='1.5'
			justifyContent='center'
			alignItems='baseline'
			ref={provided.innerRef}>
			<Center w='15px' pr='1.5' pl='1.5'>
				<Text color='gray.700' fontSize='xs'>
					{index}
				</Text>
			</Center>
			<Center w='80%' pr='15px'>
				<Text fontWeight='light' fontSize='md' isTruncated>
					{label}
				</Text>
			</Center>
			<Spacer />
			<Flex
				cursor='pointer'
				_hover={{
					color: 'red.500',
				}}
				onClick={() => openCloseDeleteLabel(label)}
				color='red.400'
				transition='all 200ms'
				willChange='color'
				title='Delete Label'
				alignItems='flex-end'
				pr='1'>
				<Icon fontSize='sm' as={IoTrash} />
			</Flex>
		</Flex>
	);

	return (
		<Draggable draggableId={label} index={index}>
			{renderLabelWrapped}
		</Draggable>
	);
});

LabelC.displayName = 'Label';

/**
 * Individual label in {@link _LabelsList `LabelsList`}.
 */
export const Label = connect(null, {
	openCloseDeleteLabel: openCloseDeleteLabelAction,
})(LabelC);
