import React, { useEffect } from 'react';
import { Center } from '@chakra-ui/react';

import { NewModel } from '_/renderer/view/components/new-model/NewModel';
import { ModelSelection } from '_/renderer/view/components/model-selection/ModelSelection';
import { connect } from 'react-redux';
import { changeSelectedPageAction } from '_/renderer/state/side-menu/SideModelAction';
import { IChangeSelectedPageAction } from '_/renderer/state/side-menu/model/actionTypes';
import { HOME_PAGE } from '../helpers/constants/pageConstants';

interface Props {
	changeSelectedPage: (pageNumber: number) => IChangeSelectedPageAction;
}

/**
 * Component for main portion of **renderer**.
 *
 * @react
 */
const Main = ({ changeSelectedPage }: Props) => {
	useEffect(() => {
		changeSelectedPage(HOME_PAGE);
	}, []);

	return (
		<Center w='full' h='full' overflowY='auto' marginTop='var(--header-height)'>
			<NewModel />
			<ModelSelection />
		</Center>
	);
};

export default connect(null, {
	changeSelectedPage: changeSelectedPageAction,
})(Main);
