import {
	Badge,
	Box,
	Popover,
	PopoverArrow,
	PopoverBody,
	PopoverContent,
	PopoverTrigger,
	HStack,
	Text,
} from '@chakra-ui/react';
import React from 'react';
import { connect } from 'react-redux';
import { IEngineStatusReducer } from '_/renderer/state/engine-status/model/reducerTypes';
import { IAppState } from '_/renderer/state/reducers';

import './StatusIndicator.css';

interface Props {
	onColor: 'pulse-green' | 'pulse-red' | 'pulse-teal';
	offColor: 'pulse-green' | 'pulse-red' | 'pulse-teal';
	engineStarted: IEngineStatusReducer;
}

const StatusIndicatorC = (props: Props) => {
	return (
		<Popover
			isLazy
			lazyBehavior='keepMounted'
			arrowSize={4}
			closeOnEsc={false}
			arrowPadding={12}>
			<PopoverTrigger>
				<Box
					className={`${
						props.engineStarted.value ? props.onColor + '-once' : props.offColor
					}`}
					w='13px'
					h='13px'
					css={{ '-webkit-app-region': 'no-drag', transition: 'all 300ms ease' }}
					transform='scale(1)'
					borderRadius='50%'
					_hover={{ transform: 'scale(1.15)' }}
					bg={props.engineStarted.value ? 'green.500' : 'red.500'}
				/>
			</PopoverTrigger>

			<PopoverContent mt='1' w='fit-content' _focus={{ outline: 'none' }}>
				<PopoverArrow />
				<PopoverBody>
					<HStack spacing='2'>
						<Text fontSize='xs'>Engine Status: </Text>
						<Badge
							css={{ transition: 'all 300ms ease' }}
							variant='outline'
							colorScheme={props.engineStarted.value ? 'green' : 'red'}>
							{props.engineStarted.value ? 'Online' : 'Offline'}
						</Badge>
					</HStack>
				</PopoverBody>
			</PopoverContent>
		</Popover>
	);
};

const mapStateToProps = (state: IAppState) => ({
	engineStarted: state.engineStarted,
});
export const StatusIndicator = connect(mapStateToProps, {})(StatusIndicatorC);
