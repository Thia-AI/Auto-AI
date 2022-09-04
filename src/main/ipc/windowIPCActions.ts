import { ipcMain, BrowserWindow, dialog, Notification, app, MessageBoxReturnValue } from 'electron';
import { autoUpdater } from 'electron-updater';
import {
	IPC_AUTO_UPDATE_CHECK,
	IPC_AUTO_UPDATE_INSTALL_UPDATE,
	IPC_DRAG_AND_DROP_SELECT_FOLDER,
	IPC_DRAG_AND_DROP_SELECT_MULTIPLE_FILES,
	IPC_GET_APP_VERSION,
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
	 * Closes Thia.
	 */
	closeApp = () => {
		this.window.close();
		app.quit();
	};

	/**
	 * Sets up IPC actions for the main window.
	 */
	private initIPCActions = () => {
		ipcMain.handle(IPC_WINDOW_CLOSED, async () => {
			this.closeApp();
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
		ipcMain.handle(
			IPC_SHOW_CLOSE_WINDOW_DIALOG,
			async (_, engineStarted: boolean): Promise<MessageBoxReturnValue> => {
				if (engineStarted) {
					const res = await dialog.showMessageBox({
						title: 'Thia',
						message: 'Are you sure you want to quit?',
						detail: "This will stop the AI Engine and all it's processes.",
						type: 'info',
						buttons: ['Yes', 'Cancel'],
					});

					return res;
				} else {
					// Engine hasn't started don't need to ask user for confirmation
					return {
						response: 0,
						checkboxChecked: false,
					};
				}
			},
		);

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

		ipcMain.handle(IPC_DRAG_AND_DROP_SELECT_FOLDER, async (_e, title: string) => {
			const files = await dialog.showOpenDialog(this.window, {
				title,
				properties: ['openDirectory', 'dontAddToRecent', 'createDirectory', 'promptToCreate'],
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
		});

		// Handle unmaximize / maximize of window
		this.window.on('maximize', () => {
			this.window.webContents.send(IPC_WINDOW_MAXIMIZED);
		});

		this.window.on('unmaximize', () => {
			this.window.webContents.send(IPC_WINDOW_UNMAXIMIZED);
		});

		// Auto Update
		ipcMain.handle(IPC_AUTO_UPDATE_CHECK, async () => {
			await autoUpdater.checkForUpdates();
		});

		ipcMain.handle(IPC_AUTO_UPDATE_INSTALL_UPDATE, async () => {
			await autoUpdater.downloadUpdate();
		});

		ipcMain.handle(IPC_GET_APP_VERSION, () => {
			return app.getVersion();
		});
	};
}

export { WindowIPCActions };
