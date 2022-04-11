import { ipcMain, BrowserWindow, dialog, Notification, app } from 'electron';
import {
	IPC_DRAG_AND_DROP_SELECT_FOLDER,
	IPC_DRAG_AND_DROP_SELECT_MULTIPLE_FILES,
	IPC_NOTIFICATIONS_SHOW_NOTIFICATION,
	IPC_SHOW_CLOSE_WINDOW_DIALOG,
	IPC_SHOW_LOGIN_WINDOW,
	IPC_WINDOW_CLOSED,
	IPC_WINDOW_FOCUS,
	IPC_WINDOW_MAXIMIZE,
	IPC_WINDOW_MAXIMIZED,
	IPC_WINDOW_MINIMIZE,
	IPC_WINDOW_UNMAXIMIZE,
	IPC_WINDOW_UNMAXIMIZED,
} from '_/shared/ipcChannels';
import { isEmulatedDev } from '../helpers/dev';

/**
 * Class that contains IPC actions pertaining to the main renderer {@link BrowserWindow BrowserWindow}.
 */
class WindowIPCActions {
	private _mainWindow: BrowserWindow;
	private _loginWindow: BrowserWindow;

	constructor(mainWindow: BrowserWindow, loginWindow: BrowserWindow) {
		this._mainWindow = mainWindow;
		this._loginWindow = loginWindow;
		this.initIPCActions();
	}

	get window() {
		return this._mainWindow;
	}

	get loginWindow() {
		return this._loginWindow;
	}

	/**
	 * Sets up IPC actions for the main window.
	 */
	private initIPCActions = () => {
		ipcMain.handle(IPC_WINDOW_CLOSED, async () => {
			this.window.close();
			app.quit();
		});
		ipcMain.handle(IPC_WINDOW_UNMAXIMIZE, async () => {
			this.window.unmaximize();
		});

		ipcMain.handle(IPC_WINDOW_MAXIMIZE, async () => {
			this.window.maximize();
		});

		ipcMain.handle(IPC_WINDOW_MINIMIZE, async () => {
			this.window.minimize();
		});

		ipcMain.handle(IPC_WINDOW_FOCUS, async () => {
			this.window.show();
		});

		// Header
		ipcMain.handle(IPC_SHOW_CLOSE_WINDOW_DIALOG, async () => {
			const res = await dialog.showMessageBox({
				title: 'Thia',
				message: 'Are you sure you want to quit?',
				detail: "This will stop the AI Engine and all it's processes.",
				type: 'info',
				buttons: ['Yes', 'Cancel'],
			});

			return res;
		});

		// DragNDrop
		ipcMain.handle(IPC_DRAG_AND_DROP_SELECT_MULTIPLE_FILES, async () => {
			const files = await dialog.showOpenDialog(this.window, {
				title: 'Select Files to Upload',
				properties: ['openFile', 'multiSelections', 'dontAddToRecent'],
				filters: [
					{
						name: 'Images',
						extensions: ['jpg', 'png', 'jpeg'],
					},
				],
			});

			return files;
		});

		ipcMain.handle(IPC_DRAG_AND_DROP_SELECT_FOLDER, async () => {
			const files = await dialog.showOpenDialog(this.window, {
				title: 'Select Folder to Upload',
				properties: ['openDirectory', 'dontAddToRecent'],
			});

			return files;
		});

		// NotificationsHandler
		ipcMain.handle(IPC_NOTIFICATIONS_SHOW_NOTIFICATION, async (e, title: string, body: string) => {
			const notif = new Notification({
				title,
				body,
			});

			notif.on('click', async (e) => {
				e.preventDefault();
				this.window.focus();
			});

			notif.show();
		});

		// Login Window
		ipcMain.handle(IPC_SHOW_LOGIN_WINDOW, () => {
			this.loginWindow.show();
			if (isEmulatedDev) {
				this.loginWindow.webContents.openDevTools({ mode: 'detach' });
			}
		});

		// Handle unmaximize / maximize of window
		this.window.on('maximize', () => {
			this.window.webContents.send(IPC_WINDOW_MAXIMIZED);
		});

		this.window.on('unmaximize', () => {
			this.window.webContents.send(IPC_WINDOW_UNMAXIMIZED);
		});
	};
}

export { WindowIPCActions };
