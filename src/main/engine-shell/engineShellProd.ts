import { spawn, ChildProcessWithoutNullStreams } from 'child_process';
import { BrowserWindow } from 'electron';

import { EngineShell } from './base/engineShell';

export class EngineShellProd extends EngineShell {
	engine: ChildProcessWithoutNullStreams;
	// path.join(__dirname, '..', 'extraResources', 'engine', 'engine.exe')
	constructor(enginePath: string, window: BrowserWindow | null) {
		super(window);

		this.engine = spawn(enginePath);

		this.onDataChangeSetup();
		this.onExitSetup();
	}

	onDataChangeSetup = () => {
		this.engine.stdout.on('data', (data) => {
			data = data.toString();
			this.notifyOnceEngineHasStarted(data);
			this.onDataChangeUniversal(data);
		});
	};

	onExitSetup = () => {
		this.engine.on('exit', (code, signal) => {
			this.onExitUniversal(code, signal);
		});
	};
}
