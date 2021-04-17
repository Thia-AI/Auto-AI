import { BrowserWindow } from 'electron';
import * as path from 'path';

import { EngineShellDev } from './engineShellDev';
import { EngineShellProd } from './engineShellProd';

/**
 * Singleton class that handles/manages EngineShells depending on dev/prod
 */
export class EngineHandler {
	private static instance: EngineHandler;
	// only used when simulating compiled **Engine** code (to test how App will function with an
	// **Engine** .exe process rather than the .py code)
	private static readonly pathToEngineProdSimulated = path.join(
		__dirname,
		'..',
		'extraResources',
		'engine',
		'engine.exe',
	);
	// __dirname here will point to app.asar so we do path.dirname() on it to get it's
	// directory
	private static readonly pathToEngineProd = path.join(
		path.dirname(__dirname),
		'extraResources',
		'engine',
		'engine.exe',
	);
	/**
	 * Private constructor only called when creating an EngineHandler instance for
	 * first time
	 */
	private constructor() {}

	/**
	 * Gives you the EngineHandler instance from anywhere in **App** with
	 * `EngineHandler.getInstance();`
	 * @returns singleton EngineHandler instance
	 */
	public static getInstance(): EngineHandler {
		if (!EngineHandler.instance) {
			EngineHandler.instance = new EngineHandler();
		}

		return EngineHandler.instance;
	}

	/**
	 * Creates a development EngineShell which then will launch a development **Engine** process (or production if `simulatingProd = true` )
	 * @param window BrowserWindow to be managed by the EngineShell
	 * @param simulateProd whether we want to simulate a production environment i.e. to test how *App** will function with an
	 * Engine .exe process rather than the .py code
	 * @returns dev EngineShell or prod EngineShell (if `simulateProd = true` environment with development **App**) instance
	 */
	public createDevEngine = (
		window: BrowserWindow | null,
		simulateProd = false,
	): EngineShellDev | EngineShellProd => {
		if (simulateProd)
			return new EngineShellProd(EngineHandler.pathToEngineProdSimulated, window);

		return new EngineShellDev(window);
	};

	/**
	 * Creates a production EngineShell which then will launch a production **Engine** process
	 * @param window BrowserWindow to be managed by the EngineShell
	 * @returns prod EngineShell instance
	 */
	public createProdEngine = (window: BrowserWindow | null): EngineShellProd => {
		return new EngineShellProd(EngineHandler.pathToEngineProd, window);
	};
}
