import { ipcMain, BrowserWindow, dialog, Notification } from 'electron';

/**
 * Class that contains IPC actions pertaining to the main renderer {@link BrowserWindow BrowserWindow}
 */
class MainWindowIPCActions {
	protected window: BrowserWindow;

	constructor(window: BrowserWindow) {
		this.window = window;
	}

	public getWindow = () => {
		return this.window;
	};

	public initIPCActions = () => {
		ipcMain.handle('window:close', async () => {
			this.window.close();
		});
		ipcMain.handle('window:unmaximize', async () => {
			this.window.unmaximize();
		});

		ipcMain.handle('window:maximize', async () => {
			this.window.maximize();
		});

		ipcMain.handle('window:minimize', async () => {
			this.window.minimize();
		});

		ipcMain.handle('window:focus', async () => {
			this.window.show();
		});

		// Header
		ipcMain.handle('window:showCloseWindowDialog', async () => {
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
		ipcMain.handle('dragNDrop:selectMultipleFiles', async () => {
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

		ipcMain.handle('dragNDrop:selectFolder', async () => {
			const files = await dialog.showOpenDialog(this.window, {
				title: 'Select Folder to Upload',
				properties: ['openDirectory', 'dontAddToRecent'],
			});

			return files;
		});

		// NotificationsHandler
		ipcMain.handle(
			'notificationsHandler:showNotification',
			async (e, title: string, body: string) => {
				const notif = new Notification({
					title,
					body,
				});

				notif.on('click', async (e) => {
					e.preventDefault();
					this.window.focus();
				});

				notif.show();
			},
		);

		// Handle unmaximize / maximize of window
		this.window.on('maximize', () => {
			this.window.webContents.send('window:maximized');
		});

		this.window.on('unmaximize', () => {
			this.window.webContents.send('window:unmaximized');
		});
	};
}

export { MainWindowIPCActions };
