import React, { useEffect } from 'react';
import { connect } from 'react-redux';
import { Navigate } from 'react-router-dom';
import { useUser } from 'reactfire';
import { IAppState } from '_/renderer/state/reducers';
import { toast } from '../helpers/functionHelpers';

interface EngineAvailableProps {
	isEngineAvailable: boolean;
	children: React.ReactElement;
}

const EngineAvailableRouteC = ({ children: C, isEngineAvailable }: EngineAvailableProps) => {
	const { data: user } = useUser();

	useEffect(() => {
		if (!isEngineAvailable && user) {
			toast({
				title: 'Cannot Visit Page - Engine Unavailable',
				description: 'Engine is turned off or is loading',
				status: 'warning',
				duration: 3000,
				isClosable: true,
				uid: user.uid,
				saveToStore: false,
			});
		}
	}, [isEngineAvailable, user]);

	return isEngineAvailable ? C : <Navigate replace to='/' />;
};

const mapStateToProps = (state: IAppState) => ({
	isEngineAvailable: state.engineStarted.value,
});

/**
 * Custom route that requires **Engine** to have started.
 */
export const EngineAvailableRoute = connect(mapStateToProps)(EngineAvailableRouteC);
