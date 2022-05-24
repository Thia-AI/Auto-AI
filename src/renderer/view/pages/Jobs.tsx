import React, { useEffect } from 'react';
import { Center } from '@chakra-ui/react';
import { connect } from 'react-redux';
import { changeSelectedPageAction } from '_/renderer/state/side-menu/SideModelAction';
import { IChangeSelectedPageAction } from '_/renderer/state/side-menu/model/actionTypes';
import { JOBS_PAGE } from '../helpers/constants/pageConstants';

interface Props {
	changeSelectedPage: (pageNumber: number) => IChangeSelectedPageAction;
}

/**
 * Jobs page.
 *
 * @react
 */
const Jobs = React.memo(({ changeSelectedPage }: Props) => {
	useEffect(() => {
		changeSelectedPage(JOBS_PAGE);
	}, []);
	return (
		<Center w='full' h='full' marginTop='var(--header-height)'>
			Jobs
		</Center>
	);
});

Jobs.displayName = 'Jobs';

export default connect(null, {
	changeSelectedPage: changeSelectedPageAction,
})(Jobs);
