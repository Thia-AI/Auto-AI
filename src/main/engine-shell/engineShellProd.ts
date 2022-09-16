import { spawn, ChildProcessWithoutNullStreams, ChildProcess } from 'child_process';
import { app, BrowserWindow } from 'electron';
import log from 'electron-log';
import { tasklist } from 'tasklist';
import { isEmulatedDev } from '../helpers/dev';

import { EngineShell } from './base/engineShell';

interface WindowsTaskListResult {
	imageName: string;
	pid: number;
	sessionName: string;
	sessionNumber: number;
	memUsage: number;
}

interface WindowsTaskListResultVerbose extends WindowsTaskListResult {
	status: 'Running' | 'Suspended' | 'Not Responding' | 'Unknown';
	username: string;
	cpuTime: number;
	windowTitle: string;
}

const engineLog = log.scope('engine');

/**
 * Class for creating a production EngineShell.
 */
export class EngineShellProd extends EngineShell {
	engine: ChildProcessWithoutNullStreams | ChildProcess | null;
	/**
	 * Instantiates a production EngineShell and starts a production **Engine** process.
	 *
	 * @param enginePath Path to the location of engine.exe.
	 * @param window BrowserWindow that EngineShell will refer to for sending back notifications.
	 * @param simulatedProd Whether production is being simulated or not.
	 * @param uid UID of user signed in.
	 */
	constructor(enginePath: string, window: BrowserWindow | null, simulatedProd = false, uid: string) {
		super(window);
		this.engine = null;
		// Kill any Engine processes before spawning one ourselves
		this.killAnyRunningEngineProcessAndSpawnEngine(simulatedProd, enginePath, uid);
	}

	killAnyRunningEngineProcessAndSpawnEngine = (simulatedProd: boolean, enginePath: string, uid: string) => {
		(async () => {
			await this.killAnyRunningEngineProcess();
			const enclosedEnginePath = `"${enginePath}"`;
			const engineArgs = [enclosedEnginePath, `--user=${uid}`, `--user-data=${app.getPath('userData')}`];
			const engineArgsSimulated = [
				enclosedEnginePath,
				'simulated',
				`--user=${uid}`,
				`--user-data=${app.getPath('userData')}`,
			];

			if (!isEmulatedDev) {
				// If not emulating dev, make sure shell window is hidden using /b flag
				// See https://docs.microsoft.com/en-us/windows-server/administration/windows-commands/start
				// for more information
				engineArgs.unshift('/b');
				engineArgsSimulated.unshift('/b');
			}
			if (simulatedProd) {
				this.engine = spawn(`start ""`, engineArgsSimulated, {
					shell: true,
				});
			} else {
				this.engine = spawn(`start ""`, engineArgs, {
					shell: true,
				});
			}
			this.notifyOnceEngineHasStarted();
			this.onDataChangeSetup();
			this.onExitSetup();
		})();
	};

	killAnyRunningEngineProcess = async () => {
		const taskListResults = (await tasklist({
			filter: ['IMAGENAME eq engine.exe'],
		})) as WindowsTaskListResult[];
		for (const taskListResult of taskListResults) {
			try {
				engineLog.log(`Killing Engine process: ${taskListResult.imageName} with PID: ${taskListResult.pid}`);
				process.kill(taskListResult.pid);
			} catch (_err) {
				engineLog.error(`Failed to kill process: ${taskListResult.imageName} with PID: ${taskListResult.pid}`);
			}
		}
	};

	/**
	 * Overriden method for setting up streaming for prod **Engine** process' stdout messages.
	 */
	onDataChangeSetup = () => {
		if (this.engine && this.engine.stdout) {
			this.engine.stdout.on('data', (data) => {
				data = data.toString();
				this.onDataChangeUniversal(data);
			});
		}
	};

	/**
	 * Shuts down production engine.
	 */
	async shutDownEngine(notifyRenderer = true) {
		if (!this.engine) return;
		this.shutDownEngineUniversal();
		await this.killAnyRunningEngineProcess();
		if (notifyRenderer) {
			this.notifyRendererThatEngineHasStopped();
		}
	}
}
