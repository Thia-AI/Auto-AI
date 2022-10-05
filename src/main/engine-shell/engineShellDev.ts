import * as path from 'path';
import { Options, PythonShell } from 'python-shell';
import { EngineShell } from './base/engineShell';
import log from 'electron-log';
import { app, BrowserWindow } from 'electron';

const engineLog = log.scope('engine');

/**
 * Class for creating a development EngineShell.
 */
export class EngineShellDev extends EngineShell {
	private engine!: PythonShell;
	// python options

	/**
	 * Instantiates a development EngineShell and starts a development **Engine** process.
	 *
	 * @param window BrowserWindow that EngineShell will refer to for sending back notifications.
	 * @param uid UID of user signed in.
	 * @param dontRunEngine Whether we don't want to start an Engine process. Use this if running Engine process separately (running on PyCharm for example).
	 */
	constructor(window: BrowserWindow | null, uid: string, dontRunEngine?: boolean) {
		super(window);
		const options: Options = {
			mode: 'text',
			pythonPath: 'python',
			args: [`--user=${uid}`, `--user-data=${app.getPath('userData')}`],
		};
		if (!dontRunEngine) {
			this.engine = new PythonShell(path.join(__dirname, '..', 'src', 'py', 'main.py'), options);
			this.notifyRendererThatEngineIsStarting();
			this.onDataChangeSetup();
			this.onExitSetup();
			this.onErrorSetup();
		}
		this.notifyOnceEngineHasStarted();
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
	 *
	 * @param notifyRenderer Whether to notify renderer that **Engine** exited.
	 */
	shutDownEngine(notifyRenderer = true) {
		engineLog.info('Shutting down engine');
		this.shutDownEngineUniversal();
		this.engine.kill();
		if (notifyRenderer) {
			this.notifyRendererThatEngineHasStopped();
		}
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

	private onErrorSetup = () => {
		this.engine.on('pythonError', (error) => {
			engineLog.error(error);
			this.notifyRendererThatEngineHasStopped();
		});
	};
}
