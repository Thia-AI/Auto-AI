import React, { useEffect } from 'react';
import { Center } from '@chakra-ui/react';
import { connect } from 'react-redux';
import { changeSelectedPageAction } from '_/renderer/state/side-menu/SideModelAction';
import { IChangeSelectedPageAction } from '_/renderer/state/side-menu/model/actionTypes';
import { QUOTA_PAGE } from '../helpers/constants/pageConstants';
interface Props {
	changeSelectedPage: (pageNumber: number) => IChangeSelectedPageAction;
}
/**
 * Quota page.
 *
 * @react
 */
const Quota = ({ changeSelectedPage }: Props) => {
	useEffect(() => {
		changeSelectedPage(QUOTA_PAGE);
	}, []);
	return (
		<Center w='full' h='full' marginTop='var(--header-height)'>
			Quota
		</Center>
	);
};

export default connect(null, {
	changeSelectedPage: changeSelectedPageAction,
})(Quota);
