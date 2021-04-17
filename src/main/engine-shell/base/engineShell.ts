import { AxiosError } from 'axios';
import { BrowserWindow } from 'electron';
import { EngineActionHandler } from '_/main/ipc/engine-action/engineActionHandler';
import { RUNTIME_GLOBALS } from '../../config/runtimeGlobals';

/**
 * Base class for creating an EngineShell to deploy and manage **Engine**'s state
 */
export class EngineShell {
	protected window: BrowserWindow | null;
	private engineCheckTimeoutId: number | undefined;
	private engineCheckRetries: number;
	private engineCheckTimeout: number;
	private engineCheckTimeoutInitial: number;
	private engineCheckTimeoutIncreaseAmount: number;
	/**
	 * Instantiate an **Engine** Shell
	 * @param window BrowserWindow that EngineShell will refer to for sending back notifications
	 */
	constructor(window: BrowserWindow | null) {
		this.window = window;
		this.engineCheckRetries = 0;
		this.engineCheckTimeoutInitial = 500;
		this.engineCheckTimeout = this.engineCheckTimeoutInitial;
		this.engineCheckTimeoutIncreaseAmount = 750;
	}

	// Methods to be overriden
	protected onDataChangeSetup = () => {};
	protected onExitSetup = () => {};

	/**
	 * Universal method to be ran each time an **Engine** process exits
	 * @param exitCode The exit code for why the **Engine** process exited
	 * @param exitSignal The exit signal for why the **Engine** process exited
	 */
	protected onExitUniversal = (
		exitCode: number | null,
		exitSignal: string | NodeJS.Signals | null,
	) => {
		RUNTIME_GLOBALS.engineRunning = false;
		console.log(
			`Engine Stopped, exit code was '${exitCode}', exit signal was '${exitSignal}'`,
		);
	};

	/**
	 * Universal method to be ran each time a new message comes from stdout
	 * on **Engine** process
	 * @param data message that was outputted from stdout
	 */
	protected onDataChangeUniversal = (data: string) => {
		console.log(data);
	};

	/**
	 * Resets the EngineShell's timeout for managing **Engine**'s state
	 */
	public resetEngineCheckTimeout = (): void => {
		this.engineCheckTimeout = this.engineCheckTimeoutInitial;
	};

	/**
	 * Sets up notification once EngineShell has recognized the **Engine** process starting
	 * @param retries number of times to retry
	 * @returns a Promise for when EngineShell has failed to detect the **Engine** process starting
	 * (either due to the **Engine** process not starting in the first place, latency between **Engine** server
	 *  [if remote] being too high, or computer being too slow to launch **Engine** in a timely manner)
	 */
	protected notifyOnceEngineHasStarted = async (
		retries = 10,
	): Promise<boolean | undefined> => {
		const timeout = this.engineCheckTimeout;
		try {
			await EngineActionHandler.getInstance().getDevices({ timeout });
			console.log('Engine Connected');
			this.notifyRendererThatEngineHasStarted();
			this.engineCheckTimeoutId = undefined;
			this.resetEngineCheckTimeout();
			RUNTIME_GLOBALS.engineRunning = true;
			return true;
		} catch (error) {
			this.engineCheckRetries++;
			this.engineCheckTimeout += this.engineCheckTimeoutIncreaseAmount;
			const err = error as AxiosError;
			console.log(err.message);
		}
		if (this.engineCheckRetries == retries) {
			console.log('Engine Failed to Start after Retries');
			clearTimeout(this.engineCheckTimeoutId);
			this.engineCheckTimeoutId = undefined;
			this.resetEngineCheckTimeout();
			return false;
		} else {
			this.engineCheckTimeoutId = setTimeout(this.notifyOnceEngineHasStarted, 0);
		}
	};

	/**
	 * Notifies **renderer** that **Engine** process has started
	 */
	private notifyRendererThatEngineHasStarted = () => {
		this.window?.webContents.send('engine:started');
	};
}
