import React, { useEffect } from 'react';
import { Center } from '@chakra-ui/react';
import { connect } from 'react-redux';
import { changeSelectedPageAction } from '_/renderer/state/side-menu/SideModelAction';
import { IChangeSelectedPageAction } from '_/renderer/state/side-menu/model/actionTypes';
import { LOGS_PAGE } from '../helpers/constants/pageConstants';

interface Props {
	changeSelectedPage: (pageNumber: number) => IChangeSelectedPageAction;
}
/**
 * Log page.
 *
 * @react
 */
const Logs = React.memo(({ changeSelectedPage }: Props) => {
	useEffect(() => {
		changeSelectedPage(LOGS_PAGE);
	}, []);

	return (
		<Center w='full' h='full' marginTop='var(--header-height)'>
			Logs
		</Center>
	);
});

Logs.displayName = 'Logs';

export default connect(null, {
	changeSelectedPage: changeSelectedPageAction,
})(Logs);
