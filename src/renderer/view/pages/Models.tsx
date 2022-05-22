import React, { useEffect, useState } from 'react';

import { useRouteMatch } from 'react-router-dom';
import { Box, VStack } from '@chakra-ui/react';
import { push, Push } from 'connected-react-router';
import { connect } from 'react-redux';

import { EngineRequestHandler } from '_/renderer/engine-requests/engineRequestHandler';
import { ModelCard } from '../components/model-card/ModelCard';
import { Model, nullModel } from '../helpers/constants/engineDBTypes';
import { useVerticalScrollbar } from '_/shared/theming/hooks';
import { changeSelectedPageAction } from '_/renderer/state/side-menu/SideModelAction';
import { IChangeSelectedPageAction } from '_/renderer/state/side-menu/model/actionTypes';
import { MODELS_PAGE } from '../helpers/constants/pageConstants';

interface Props {
	push: Push;
	changeSelectedPage: (pageNumber: number) => IChangeSelectedPageAction;
}

const ModelsC = ({ push, changeSelectedPage }: Props) => {
	const match = useRouteMatch();
	const [models, setModels] = useState<Model[]>([]);
	const [isLoaded, setIsLoaded] = useState(false);
	const verticalScrollBarSX = useVerticalScrollbar('10px');

	useEffect(() => {
		changeSelectedPage(MODELS_PAGE);
	}, []);

	useEffect(() => {
		const fetchModels = async () => {
			const [error, resData] = await EngineRequestHandler.getInstance().getModels();
			setIsLoaded(true);
			if (!error) {
				setModels(resData['models']);
			}
		};

		fetchModels();
	}, []);
	const renderSkeleton = () => {
		return Array(8)
			.fill('')
			.map((_, i) => {
				return <ModelCard key={i} isLoaded={isLoaded} model={nullModel} onClick={() => {}} />;
			});
	};

	const renderModels = () => {
		return models.map((model) => {
			return (
				<ModelCard
					key={model.id}
					isLoaded={isLoaded}
					model={model}
					onClick={() => push(`${match.path}/${model['id']}`)}
				/>
			);
		});
	};

	const render = () => {
		if (isLoaded) {
			return renderModels();
		} else return renderSkeleton();
	};
	return (
		<Box w='full' h='full' marginTop='var(--header-height)' pt='4' overflowY='auto' sx={verticalScrollBarSX}>
			<VStack spacing='4' pb='4'>
				{render()}
			</VStack>
		</Box>
	);
};

const mapStateToProps = () => ({});

/**
 * Page for rendering all models.
 */
const Models = connect(mapStateToProps, {
	push,
	changeSelectedPage: changeSelectedPageAction,
})(ModelsC);

export default Models;
