import * as path from 'path';
import { Options, PythonShell } from 'python-shell';
import { EngineShell } from './base/engineShell';
import { BrowserWindow } from 'electron';

export class EngineShellDev extends EngineShell {
	private engine: PythonShell;
	private options: Options = {
		mode: 'text',
		pythonPath: 'python',
		pythonOptions: ['-u'],
	};

	constructor(window: BrowserWindow | null) {
		super(window);

		this.engine = new PythonShell(
			path.join(__dirname, '..', 'src', 'py', 'main.py'),
			this.options,
		);
		this.notifyOnceEngineHasStarted();
		this.onDataChangeSetup();
		this.onExitSetup();
	}

	protected onDataChangeSetup = () => {
		this.engine.on('message', (message) => {
			this.onDataChangeUniversal(message);
		});
	};

	protected onExitSetup = () => {
		this.engine.end((err, exitCode, exitSignal) => {
			if (err) throw err;
			this.onExitUniversal(exitCode, exitSignal);
		});
	};
}
