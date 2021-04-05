import { AxiosError } from 'axios';
import { BrowserWindow } from 'electron';
import { EngineActionHandler } from '_/main/ipc/engine-action/engineActionHandler';
import { RUNTIME_GLOBALS } from '../../config/runtimeGlobals';

export class EngineShell {
	protected window: BrowserWindow | null;
	private engineCheckTimeoutId: number | undefined;
	private engineCheckRetries: number;
	private engineCheckTimeout: number;
	private engineCheckTimeoutInitial: number;
	private engineCheckTimeoutIncreaseAmount: number;
	constructor(window: BrowserWindow | null) {
		this.window = window;
		this.engineCheckRetries = 0;
		this.engineCheckTimeoutInitial = 500;
		this.engineCheckTimeout = this.engineCheckTimeoutInitial;
		this.engineCheckTimeoutIncreaseAmount = 750;
	}

	protected onDataChangeSetup = () => {};
	protected onExitSetup = () => {};

	protected onExitUniversal = (
		exitCode: number | null,
		exitSignal: string | NodeJS.Signals | null,
	) => {
		console.log(
			`Engine Stopped, exit code was '${exitCode}', exit signal was '${exitSignal}'`,
		);
	};

	protected onDataChangeUniversal = (data: string) => {
		console.log(data);
	};

	public resetEngineCheckTimeout = (): void => {
		this.engineCheckTimeout = this.engineCheckTimeoutInitial;
	};

	protected notifyOnceEngineHasStarted = async (retries: number = 10) => {
		let timeout = this.engineCheckTimeout;
		try {
			await EngineActionHandler.getInstance().getDevices({ timeout });
			console.log('Engine Connected');
			this.notifyRendererThatEngineHasStarted();
			this.engineCheckTimeoutId = undefined;
			this.resetEngineCheckTimeout();
			RUNTIME_GLOBALS.engineRunning = true;
			return;
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
		} else {
			this.engineCheckTimeoutId = setTimeout(this.notifyOnceEngineHasStarted, 0);
		}
	};

	private notifyRendererThatEngineHasStarted = () => {
		this.window?.webContents.send('engine:started');
	};

	protected setupListeners = () => {};
}
