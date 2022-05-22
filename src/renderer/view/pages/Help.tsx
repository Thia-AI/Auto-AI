import React, { useEffect } from 'react';
import { Center } from '@chakra-ui/react';
import { connect } from 'react-redux';
import { changeSelectedPageAction } from '_/renderer/state/side-menu/SideModelAction';
import { IChangeSelectedPageAction } from '_/renderer/state/side-menu/model/actionTypes';
import { HELP_PAGE } from '../helpers/constants/pageConstants';

interface Props {
	changeSelectedPage: (pageNumber: number) => IChangeSelectedPageAction;
}
/**
 * Help page.
 *
 * @react
 */
const Help = ({ changeSelectedPage }: Props) => {
	useEffect(() => {
		changeSelectedPage(HELP_PAGE);
	}, []);
	return (
		<Center w='full' h='full' marginTop='var(--header-height)'>
			Help
		</Center>
	);
};

export default connect(null, {
	changeSelectedPage: changeSelectedPageAction,
})(Help);
