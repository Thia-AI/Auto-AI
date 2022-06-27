import React, { useEffect } from 'react';
import { connect } from 'react-redux';
import { Navigate } from 'react-router-dom';
import { IAppState } from '_/renderer/state/reducers';
import { toast } from '../helpers/functionHelpers';

interface EngineAvailableProps {
	isEngineAvailable: boolean;
	children: React.ReactElement;
}

const EngineAvailableRouteC = ({ children: C, isEngineAvailable }: EngineAvailableProps) => {
	useEffect(() => {
		if (!isEngineAvailable) {
			toast({
				title: 'Cannot Visit Page - Engine Unavailable',
				description: 'Engine is turned off or is loading',
				status: 'warning',
				duration: 3000,
				isClosable: true,
				saveToStore: false,
			});
		}
	}, [isEngineAvailable]);

	return isEngineAvailable ? C : <Navigate replace to='/' />;
};

const mapStateToProps = (state: IAppState) => ({
	isEngineAvailable: state.engineStarted.value,
});

/**
 * Custom route that requires **Engine** to have started.
 */
export const EngineAvailableRoute = connect(mapStateToProps)(EngineAvailableRouteC);
