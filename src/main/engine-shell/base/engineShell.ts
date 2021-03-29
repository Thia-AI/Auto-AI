export class EngineShell {
	constructor() {}

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

	protected setupListeners = () => {};
}
