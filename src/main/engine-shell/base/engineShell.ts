import { BrowserWindow } from 'electron';
import { RUNTIME_GLOBALS } from '../../config/runtimeGlobals';
export class EngineShell {
	protected window: BrowserWindow | null;
	constructor(window: BrowserWindow | null) {
		this.window = window;
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

	protected notifyOnceEngineHasStarted = (data: string) => {
		if (!RUNTIME_GLOBALS.engineRunning) {
			if (data.includes('Serving')) {
				RUNTIME_GLOBALS.engineRunning = true;
				console.log('AI Engine Started');
				this.notifyRendererThatEngineHasStarted();
			}
		}
	};

	private notifyRendererThatEngineHasStarted = () => {
		this.window?.webContents.send('engine:started');
	};

	protected setupListeners = () => {};
}
