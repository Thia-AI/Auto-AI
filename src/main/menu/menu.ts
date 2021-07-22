import { Menu, MenuItem } from 'electron';
import { isEmulatedDev } from '../helpers/dev';

/**
 * Electron menu
 */
const menu = new Menu();

// only add toggleDevTools and reloading if in devleopment mode
if (isEmulatedDev) {
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
