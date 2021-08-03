import React, { useState, useEffect } from 'react';

import { useDisclosure } from '@chakra-ui/react';
import { ipcRenderer } from 'electron';

export const DevDashboard = React.memo(() => {
	const { isOpen, onOpen, onClose } = useDisclosure();

	const [isDev, setIsDev] = useState(false);

	useEffect(() => {
		const setupDev = async () => {
			setIsDev(await ipcRenderer.invoke('runtime:is-dev'));
		};

		setupDev();
	}, []);
	return <></>;
});
