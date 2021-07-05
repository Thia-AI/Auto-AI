import React, { useEffect, useState } from 'react';

import { Box, Center } from '@chakra-ui/react';
import { useRouteMatch } from 'react-router-dom';

import { EngineActionHandler } from '_engine_requests/engineActionHandler';
import { Dataset } from '_view_helpers/constants/engineDBTypes';

const Dataset = React.memo(() => {
	const datasetID = useRouteMatch().params['id'];
	const [dataset, setDataset] = useState<Dataset | undefined>(undefined);

	useEffect(() => {
		const fetchDataset = async () => {
			const [error, resData] = await EngineActionHandler.getInstance().getDataset(datasetID);
			if (!error) {
				setDataset(resData);
			}
		};

		fetchDataset();
	}, []);

	return (
		<Center w='full' h='full' marginTop='var(--header-height)'>
			<Box>Dataset: {dataset?.name}</Box>
		</Center>
	);
});

export default Dataset;
