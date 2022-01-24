import { BrowserWindow } from 'electron';

export const READ_FILE = 'READ_FILE';

export type ReadFileWorkerTask = {
	type: typeof READ_FILE;
	payload: {
		filePath: string;
	};
};

export type ReadFileTaskResult = {
	type: typeof READ_FILE;
	filePath: string;
	isError: boolean;
	data: string | any;
};

/**
 * Object type for process id -> {@link BrowserWindow `BrowserWindow`}
 */
export type WorkerMap = {
	[key: number]: BrowserWindow;
};

export type WorkerTask = ReadFileWorkerTask;
export type TaskResult = ReadFileTaskResult;
