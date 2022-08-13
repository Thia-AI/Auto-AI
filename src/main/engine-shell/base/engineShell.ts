import { AxiosError } from 'axios';
import { BrowserWindow } from 'electron';
import log from 'electron-log';
import { RUNTIME_GLOBALS } from '../../config/runtimeGlobals';
import EngineRequestConfig from '_/shared/engineRequestConfig';
import { IPC_ENGINE_STARTED, IPC_ENGINE_STOPPED } from '_/shared/ipcChannels';

const engineLog = log.scope('engine');

/**
 * Base class for creating an EngineShell to deploy and manage **Engine**'s state.
 */
export abstract class EngineShell {
	protected window: BrowserWindow | null;
	private engineCheckTimeoutId: number | undefined;
	private engineCheckRetries: number;
	private engineCheckTimeout: number;
	private engineCheckTimeoutInitial: number;
	private engineCheckTimeoutIncreaseAmount: number;
	private stopWaitingForEngineStartFlag: boolean;

	/**
	 * Instantiate an **Engine** Shell.
	 *
	 * @param window BrowserWindow that EngineShell will refer to for sending back notifications.
	 */
	constructor(window: BrowserWindow | null) {
		this.window = window;
		this.engineCheckRetries = 0;
		this.engineCheckTimeoutInitial = 500;
		this.engineCheckTimeout = this.engineCheckTimeoutInitial;
		this.engineCheckTimeoutIncreaseAmount = 750;
		this.stopWaitingForEngineStartFlag = false;
	}

	/**
	 * Setting up streaming for **Engine** process' stdout messages.
	 * To be overriden.
	 */
	protected onDataChangeSetup = () => {};
	/**
	 * Setting up listener for when **Engine** process exit's unexpectedly.
	 * To be overriden.
	 */
	protected onExitSetup = () => {};

	/**
	 * Universal method to be ran each time an **Engine** process exits.
	 *
	 * @param exitCode The exit code for why the **Engine** process exited.
	 * @param exitSignal The exit signal for why the **Engine** process exited.
	 */
	protected onExitUniversal = (exitCode: number | null, exitSignal: string | NodeJS.Signals | null) => {
		RUNTIME_GLOBALS.engineRunning = false;
		engineLog.info(`Engine Stopped, exit code was '${exitCode}', exit signal was '${exitSignal}'`);
	};

	/**
	 * Universal method to be ran each time **Engine** process needs to be shutdown.
	 */
	protected shutDownEngineUniversal = () => {
		this.stopWaitingForEngineStartFlag = true;
	};

	/**
	 * Universal method to be ran each time a new message comes from stdout
	 * on **Engine** process.
	 *
	 * @param data Message that was outputted from stdout.
	 */
	protected onDataChangeUniversal = (data: string) => {
		engineLog.info(data);
	};

	/**
	 * Resets the EngineShell's timeout for managing **Engine**'s state.
	 */
	public resetEngineCheckTimeout = (): void => {
		this.engineCheckTimeout = this.engineCheckTimeoutInitial;
	};

	/**
	 * Sets up notification once EngineShell has recognized the **Engine** process starting.
	 *
	 * @param retries Number of times to retry.
	 * @returns A {@link Promise `Promise`} for when EngineShell has failed to detect the **Engine** process starting
	 * (either due to the **Engine** process not starting in the first place, latency between **Engine** server
	 *  [if remote] being too high, or computer being too slow to launch **Engine** in a timely manner).
	 */
	protected notifyOnceEngineHasStarted = async (retries = 100): Promise<boolean | undefined> => {
		for (let i = 0; i < retries; i++) {
			// If Engine was shut down before it started, we need to stop checking for it.
			if (this.stopWaitingForEngineStartFlag) {
				return;
			}
			const timeout = this.engineCheckTimeout;
			const initialTime = new Date().getTime();
			try {
				await EngineRequestConfig.get('/devices', { timeout });
				engineLog.info('Engine Connected');
				this.notifyRendererThatEngineHasStarted();
				this.engineCheckTimeoutId = undefined;
				this.resetEngineCheckTimeout();
				return true;
			} catch (error) {
				this.engineCheckRetries++;
				this.engineCheckTimeout += this.engineCheckTimeoutIncreaseAmount;
				const err = error as AxiosError;
				engineLog.error(err.code);
				engineLog.error(err.message);
			}
			const afterTime = new Date().getTime();
			// sleep for difference
			await sleep(Math.abs(timeout - (afterTime - initialTime)));
		}
		engineLog.error('Engine Failed to Start after Retries');
		clearTimeout(this.engineCheckTimeoutId);
		this.engineCheckTimeoutId = undefined;
		this.resetEngineCheckTimeout();
		return false;
	};

	/**
	 * Notifies **renderer** that the **Engine** process has started.
	 */
	private notifyRendererThatEngineHasStarted = () => {
		RUNTIME_GLOBALS.engineRunning = true;
		this.window?.webContents.send(IPC_ENGINE_STARTED);
	};

	/**
	 * Notifies **renderer** that the **Engine** process has stopped.
	 */
	protected notifyRendererThatEngineHasStopped = () => {
		RUNTIME_GLOBALS.engineRunning = false;
		this.window?.webContents.send(IPC_ENGINE_STOPPED);
	};

	/**
	 * Abstract method that shuts down engine.
	 */
	abstract shutDownEngine(): void;
}

/**
 * Helper method to sleep in async/await.
 *
 * @param ms Milliseconds to sleep for.
 * @returns N/A.
 */
export const sleep = (ms: number) => {
	return new Promise((resolve) => setTimeout(resolve, ms));
};
