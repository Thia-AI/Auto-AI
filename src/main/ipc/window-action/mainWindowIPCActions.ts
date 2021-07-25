import { ipcMain, BrowserWindow } from 'electron';

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

		this.initWindowIPCActions();
	};

	/**
	 * Send back IPC message to renderer maximizes/unmaximizes the BW
	 */
	private initWindowIPCActions = () => {
		this.window.on('maximize', () => {
			this.window.webContents.send('window:maximized');
		});

		this.window.on('unmaximize', () => {
			this.window.webContents.send('window:unmaximized');
		});
	};
}

export { MainWindowIPCActions };
