import React, { useEffect } from 'react';
import { Center } from '@chakra-ui/react';
import { connect } from 'react-redux';
import { changeSelectedPageAction } from '_/renderer/state/side-menu/SideModelAction';
import { IChangeSelectedPageAction } from '_/renderer/state/side-menu/model/actionTypes';
import { SUBSCRIPTION_PAGE } from '../helpers/constants/pageConstants';

interface Props {
	changeSelectedPage: (pageNumber: number) => IChangeSelectedPageAction;
}
/**
 * Subscription page.
 *
 * @react
 */
const Subscription = React.memo(({ changeSelectedPage }: Props) => {
	useEffect(() => {
		changeSelectedPage(SUBSCRIPTION_PAGE);
	}, []);
	return (
		<Center w='full' h='full' marginTop='var(--header-height)'>
			Subscription
		</Center>
	);
});

Subscription.displayName = 'Subscription';

export default connect(null, {
	changeSelectedPage: changeSelectedPageAction,
})(Subscription);
