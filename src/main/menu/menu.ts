import { Menu, MenuItem } from 'electron';
import { isEmulatedDev } from '../helpers/dev';

/**
 * Electron menu
 */
const mainWindowMenu = new Menu();
const loginWindowMenu = new Menu();

// only add toggleDevTools and reloading if in devleopment mode
if (isEmulatedDev) {
	mainWindowMenu.append(
		new MenuItem({
			role: 'toggleDevTools',
			accelerator: 'Ctrl+Shift+I',
			visible: true,
		}),
	);

	mainWindowMenu.append(
		new MenuItem({
			role: 'forceReload',
			accelerator: 'Ctrl+Shift+R',
			visible: true,
		}),
	);

	mainWindowMenu.append(
		new MenuItem({
			role: 'reload',
			accelerator: 'Ctrl+R',
			visible: true,
		}),
	);
}

export { mainWindowMenu as menu };
