import * as path from 'path';
import { Options, PythonShell } from 'python-shell';
import { EngineShell } from './base/engineShell';
import { BrowserWindow } from 'electron';

/**
 * Class for creating a development EngineShell.
 */
export class EngineShellDev extends EngineShell {
	private engine: PythonShell;
	// python options
	private options: Options = {
		mode: 'text',
		pythonPath: 'python',
		// pythonOptions: ['-u'],
	};

	/**
	 * Instantiates a development EngineShell and starts a development **Engine** process.
	 *
	 * @param window BrowserWindow that EngineShell will refer to for sending back notifications.
	 */
	constructor(window: BrowserWindow | null) {
		super(window);
		this.engine = new PythonShell(path.join(__dirname, '..', 'src', 'py', 'main.py'), this.options);
		this.notifyOnceEngineHasStarted();
		this.onDataChangeSetup();
		this.onExitSetup();
	}

	/**
	 * Overriden method for setting up streaming for dev **Engine** process' stdout messages.
	 */
	protected onDataChangeSetup = () => {
		this.engine.on('message', (message) => {
			this.onDataChangeUniversal(message);
		});
	};

	/**
	 * Shuts down dev engine.
	 */
	shutDownEngine(): void {
		console.log('Shutting down engine');
		this.engine.kill();
		this.notifyRendererThatEngineHasStopped();
	}

	/**
	 * Overriden method for setting up listener for when dev **Engine** process exit's unexpectedly.
	 */
	protected onExitSetup = () => {
		this.engine.end((err, exitCode, exitSignal) => {
			if (err) throw err;
			this.onExitUniversal(exitCode, exitSignal);
		});
	};
}
