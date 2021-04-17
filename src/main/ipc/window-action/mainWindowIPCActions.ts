import { ipcMain, BrowserWindow } from 'electron';

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
			// console.log('Closed');
			this.window.close();
		});

		ipcMain.handle('window:unmaximize', async () => {
			// console.log('Unmaximized');
			this.window.unmaximize();
		});

		ipcMain.handle('window:maximize', async () => {
			// console.log('Maximized');
			this.window.maximize();
		});

		ipcMain.handle('window:minimize', async () => {
			// console.log('Minimized');
			this.window.minimize();
		});

		this.initWindowIPCActions();
	};

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
