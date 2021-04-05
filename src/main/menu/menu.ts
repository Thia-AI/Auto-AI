import { Menu, MenuItem } from 'electron';

const isDev = require('electron-is-dev');

const menu = new Menu();

if (isDev) {
	menu.append(
		new MenuItem({
			role: 'toggleDevTools',
			accelerator: 'Ctrl+Shift+I',
		}),
	);

	menu.append(
		new MenuItem({
			role: 'forceReload',
			accelerator: 'Ctrl+Shift+R',
		}),
	);

	menu.append(
		new MenuItem({
			role: 'reload',
			accelerator: 'Ctrl+R',
		}),
	);
}

export { menu };
