import React, { useEffect } from 'react';
import { Center } from '@chakra-ui/react';
import { connect } from 'react-redux';
import { changeSelectedPageAction } from '_/renderer/state/side-menu/SideModelAction';
import { IChangeSelectedPageAction } from '_/renderer/state/side-menu/model/actionTypes';
import { EXPORTS_PAGE } from '../helpers/constants/pageConstants';

interface Props {
	changeSelectedPage: (pageNumber: number) => IChangeSelectedPageAction;
}

/**
 * Exports page.
 *
 * @react
 */
const Exports = React.memo(({ changeSelectedPage }: Props) => {
	useEffect(() => {
		changeSelectedPage(EXPORTS_PAGE);
	}, []);
	return (
		<Center w='full' h='full' marginTop='var(--header-height)'>
			Exports
		</Center>
	);
});

Exports.displayName = 'Exports';

export default connect(null, {
	changeSelectedPage: changeSelectedPageAction,
})(Exports);
