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
}

export { menu };
