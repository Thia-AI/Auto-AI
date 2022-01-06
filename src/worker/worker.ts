import { ipcRenderer } from 'electron';
import { promises } from 'fs';
import {
	IPC_WORKER_READY,
	IPC_WORKER_READY_TO_INIT,
	IPC_WORKER_TASK_DONE,
	IPC_WORKER_TASK_RECEIVED,
} from '_/shared/ipcChannels';

import {
	ReadFileTaskResult,
	ReadFileWorkerTask,
	READ_FILE,
	WorkerTask,
} from '_/shared/worker_constants';
// Entry point for background hidden renderer workers
document.title = `Worker - ${process.pid}`;

ipcRenderer.on(IPC_WORKER_READY_TO_INIT, async () => {
	await ready();
});

ipcRenderer.on(IPC_WORKER_TASK_RECEIVED, async (event, task: WorkerTask) => {
	if (task.type == READ_FILE) {
		task = task as ReadFileWorkerTask;
		const [isError, data] = await readFile(task.payload.filePath);
		const result: ReadFileTaskResult = {
			type: READ_FILE,
			isError,
			data,
			filePath: task.payload.filePath,
		};
		await ipcRenderer.invoke(IPC_WORKER_TASK_DONE, result);
	}
	await ready();
});

const ready = async () => {
	await ipcRenderer.invoke(IPC_WORKER_READY);
};

/**
 * Reads file from filesystem (currently only images). DO NOT use this to set
 * images/background image srcs, use file:// instead.
 * @param filePath File path for image
 * @returns tuple of whether there was an error and image data (or error object if error)
 */
const readFile = async (filePath: string): Promise<[boolean, string | any]> => {
	try {
		const fileData = await promises.readFile(filePath, {
			encoding: 'base64',
		});
		return [false, fileData];
	} catch (err) {
		return [true, err];
	}
};
