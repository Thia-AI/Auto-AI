import { spawn, ChildProcessWithoutNullStreams } from 'child_process';
import { BrowserWindow } from 'electron';

import { EngineShell } from './base/engineShell';

/**
 * Class for creating a production EngineShell
 */
export class EngineShellProd extends EngineShell {
	engine: ChildProcessWithoutNullStreams;
	/**
	 * Instantiates a production EngineShell and starts a production **Engine** process
	 * @param enginePath path to the location of engine.exe
	 * @param window BrowserWindow that EngineShell will refer to for sending back notifications
	 */
	constructor(enginePath: string, window: BrowserWindow | null) {
		super(window);

		this.engine = spawn(enginePath, ['--line-buffered']);

		this.notifyOnceEngineHasStarted();
		this.onDataChangeSetup();
		this.onExitSetup();
	}

	/**
	 * Overriden method for setting up streaming for prod **Engine** process' stdout messages
	 */
	onDataChangeSetup = () => {
		this.engine.stdout.on('data', (data) => {
			data = data.toString();
			this.onDataChangeUniversal(data);
		});
	};

	/**
	 * Overriden method for setting up listener for when prod **Engine** process exit's unexpectedly
	 */
	onExitSetup = () => {
		this.engine.on('exit', (code, signal) => {
			this.onExitUniversal(code, signal);
		});
	};
}
