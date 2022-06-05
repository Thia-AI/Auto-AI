import React, { useEffect } from 'react';
import { connect } from 'react-redux';
import { Redirect, Route, RouteProps } from 'react-router-dom';
import { IAppState } from '_/renderer/state/reducers';
import { toast } from '../helpers/functionHelpers';

interface EngineAvailableProps extends RouteProps {
	component: React.ComponentType<any>; // eslint-disable-line @typescript-eslint/no-explicit-any
	isEngineAvailable: boolean;
}

const EngineAvailableRouteC = ({ component: C, isEngineAvailable, ...rest }: EngineAvailableProps) => {
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

	if (isEngineAvailable) {
		return <Route {...rest} render={(props) => <C {...props} />} />;
	}
	return <Redirect to='/' />;
};

const mapStateToProps = (state: IAppState) => ({
	isEngineAvailable: state.engineStarted.value,
});

/**
 * Custom route that requires **Engine** to have started.
 */
export const EngineAvailableRoute = connect(mapStateToProps)(EngineAvailableRouteC);
