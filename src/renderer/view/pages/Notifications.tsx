import React, { useEffect } from 'react';
import { Center } from '@chakra-ui/react';
import { connect } from 'react-redux';
import { changeSelectedPageAction } from '_/renderer/state/side-menu/SideModelAction';
import { IChangeSelectedPageAction } from '_/renderer/state/side-menu/model/actionTypes';
import { NOTIFICATIONS_PAGE } from '../helpers/constants/pageConstants';

interface Props {
	changeSelectedPage: (pageNumber: number) => IChangeSelectedPageAction;
}
/**
 * Notifications page.
 *
 * @react
 */
const Notifications = ({ changeSelectedPage }: Props) => {
	useEffect(() => {
		changeSelectedPage(NOTIFICATIONS_PAGE);
	}, []);
	return (
		<Center w='full' h='full' marginTop='var(--header-height)'>
			Notifications
		</Center>
	);
};

export default connect(null, {
	changeSelectedPage: changeSelectedPageAction,
})(Notifications);
