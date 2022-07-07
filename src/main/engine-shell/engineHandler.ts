import { BrowserWindow } from 'electron';
import * as path from 'path';

import { EngineShellDev } from './engineShellDev';
import { EngineShellProd } from './engineShellProd';

/**
 * Options when creating a dev **Engine**.
 */
interface CreateDevEngineOptions {
	/**
	 * Whether we want to simulate a production environment i.e. to test how *App** will function with an
	 * Engine .exe process rather than the .py code.
	 */
	simulateProd?: boolean;
	uid: string;
}

/**
 * Options when creating a prod **Engine**.
 */
interface CreateProdEngineOptions {
	uid: string;
}

/**
 * Singleton class that handles/manages EngineShells depending on dev/prod.
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

	private constructor() {}

	/**
	 * Gives you the EngineHandler instance from anywhere in **App** with
	 * `EngineHandler.getInstance();`.
	 *
	 * @returns Singleton {@link EngineHandler `EngineHandler`} instance.
	 */
	public static getInstance(): EngineHandler {
		if (!EngineHandler.instance) {
			EngineHandler.instance = new EngineHandler();
		}

		return EngineHandler.instance;
	}

	/**
	 * Creates a development EngineShell which then will launch a development **Engine** process (or production if `simulatingProd = true` ).
	 *
	 * @param window BrowserWindow to be managed by the EngineShell.
	 * @param options Options when creating a dev **Engine**.
	 * @returns A {@link EngineShellDev `development EngineShell`} or a {@link EngineShellProd `production EngineShell`} (if `simulateProd = true` environment with development **App**) instance.
	 */
	public createDevEngine = (
		window: BrowserWindow | null,
		options: CreateDevEngineOptions,
	): EngineShellDev | EngineShellProd => {
		const defaultCreateDevEngineOptions = { simulateProd: false };
		const { simulateProd, uid } = { ...defaultCreateDevEngineOptions, ...options };

		if (simulateProd) return new EngineShellProd(EngineHandler.pathToEngineProdSimulated, window, true, uid);

		return new EngineShellDev(window, uid);
	};

	/**
	 * Creates a production EngineShell which then will launch a production **Engine** process.
	 *
	 * @param window BrowserWindow to be managed by the EngineShell.
	 * @param options Options when creating a prod **Engine**.
	 * @returns Prod EngineShell instance.
	 */
	public createProdEngine = (window: BrowserWindow | null, options: CreateProdEngineOptions): EngineShellProd => {
		const { uid } = options;
		return new EngineShellProd(EngineHandler.pathToEngineProd, window, false, uid);
	};
}
