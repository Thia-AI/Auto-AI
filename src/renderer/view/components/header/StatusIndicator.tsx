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
	Button,
	VStack,
} from '@chakra-ui/react';
import { ipcRenderer } from 'electron';
import React from 'react';
import { connect } from 'react-redux';
import { useUser } from 'reactfire';
import { IEngineStatusReducer } from '_/renderer/state/engine-status/model/reducerTypes';
import { IAppState } from '_/renderer/state/reducers';
import { IPC_ENGINE_START } from '_/shared/ipcChannels';

import './StatusIndicator.css';

type PulseColors = 'green' | 'red' | 'teal' | 'purple';

type PulseColorToChakraMap = {
	[key in PulseColors]: string;
};

const pulseColorToChakraMap: PulseColorToChakraMap = {
	green: 'green',
	red: 'red',
	teal: 'teal',
	purple: 'thia.purple',
};
interface Props {
	onColor: PulseColors;
	offColor: PulseColors;
	startingColor: PulseColors;
	engineStarted: IEngineStatusReducer;
	engineStarting: boolean;
}

const StatusIndicatorC = React.memo(({ engineStarted, onColor, offColor, engineStarting, startingColor }: Props) => {
	const { data: user } = useUser();

	return (
		<Popover isLazy lazyBehavior='keepMounted' arrowSize={4} closeOnEsc={false} arrowPadding={12}>
			<PopoverTrigger>
				<Box
					className={`${
						engineStarted.value ? onColor + '-once' : engineStarting ? startingColor : offColor + '-once'
					}`}
					w='13px'
					h='13px'
					css={{ '-webkit-app-region': 'no-drag', transition: 'all 300ms ease' }}
					transform='scale(1)'
					borderRadius='50%'
					_hover={{ transform: 'scale(1.15)' }}
					bg={
						engineStarted.value
							? `${pulseColorToChakraMap[onColor]}.500`
							: engineStarting
							? `${pulseColorToChakraMap[startingColor]}.400`
							: `${pulseColorToChakraMap[offColor]}.500`
					}
				/>
			</PopoverTrigger>

			<PopoverContent mt='1' w='fit-content'>
				<PopoverArrow />
				<PopoverBody>
					<VStack>
						<HStack spacing='2'>
							<Text fontSize='xs'>Engine Status: </Text>
							<Badge
								transition='all 300ms ease'
								variant='outline'
								colorScheme={
									engineStarted.value
										? pulseColorToChakraMap[onColor]
										: engineStarting
										? pulseColorToChakraMap[startingColor]
										: pulseColorToChakraMap[offColor]
								}>
								{engineStarted.value ? 'Online' : engineStarting ? 'Launching' : 'Offline'}
							</Badge>
						</HStack>
						<Button
							size='xs'
							w='full'
							py='3.5'
							colorScheme='thia.purple'
							onClick={async () => {
								if (user) {
									await ipcRenderer.invoke(IPC_ENGINE_START, user.uid);
								}
							}}
							disabled={engineStarting || engineStarted.value}>
							Launch Engine
						</Button>
					</VStack>
				</PopoverBody>
			</PopoverContent>
		</Popover>
	);
});

StatusIndicatorC.displayName = 'StatusIndicator';

const mapStateToProps = (state: IAppState) => ({
	engineStarted: state.engineStarted,
});
/**
 * Status indicator representing **Engine**'s current status
 */
export const StatusIndicator = connect(mapStateToProps, {})(StatusIndicatorC);
