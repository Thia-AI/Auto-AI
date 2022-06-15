import { chakra } from '@chakra-ui/react';
import { Replace, replace } from 'connected-react-router';
import React from 'react';
import { connect } from 'react-redux';

interface Props {
	replace: Replace;
	replacePath: string;
}

interface State {
	hasError: boolean;
}
class ErrorBoundaryReplace extends React.Component<Props, State> {
	constructor(props) {
		super(props);
		this.state = { hasError: false };
	}

	static getDerivedStateFromError() {
		// Update state so the next render will show the fallback UI.
		return { hasError: true };
	}

	componentDidCatch() {
		// You can also log the error to an error reporting service
		//   logErrorToMyService(error, errorInfo);
		const { replace, replacePath } = this.props;
		replace(replacePath);
	}

	render() {
		const { children } = this.props;
		const { hasError } = this.state;

		if (hasError) {
			return <chakra.h1>Uh oh</chakra.h1>;
		}
		return children;
	}
}

export default connect(null, {
	replace,
})(ErrorBoundaryReplace);
