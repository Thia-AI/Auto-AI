import React, { useEffect } from 'react';
import { Center } from '@chakra-ui/react';
import { connect } from 'react-redux';
import { changeSelectedPageAction } from '_/renderer/state/side-menu/SideModelAction';
import { IChangeSelectedPageAction } from '_/renderer/state/side-menu/model/actionTypes';
import { DEPLOYMENTS_PAGE } from '../helpers/constants/pageConstants';

interface Props {
	changeSelectedPage: (pageNumber: number) => IChangeSelectedPageAction;
}
/**
 * Deployments page.
 *
 * @react
 */
const Deployments = React.memo(({ changeSelectedPage }: Props) => {
	useEffect(() => {
		changeSelectedPage(DEPLOYMENTS_PAGE);
	}, []);
	return (
		<Center w='full' h='full' marginTop='var(--header-height)'>
			Deployments
		</Center>
	);
});

Deployments.displayName = 'Deployments';

export default connect(null, {
	changeSelectedPage: changeSelectedPageAction,
})(Deployments);
