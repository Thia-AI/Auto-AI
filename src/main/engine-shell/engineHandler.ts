import * as path from 'path';

import { EngineShellDev } from './engineShellDev';
import { EngineShellProd } from './engineShellProd';

export class EngineHandler {
	private static instance: EngineHandler;
	private static readonly pathToEngineProdSimulated = path.join(
		__dirname,
		'..',
		'extraResources',
		'engine',
		'engine.exe',
	);
	private static readonly pathToEngineProd = path.join(
		path.dirname(__dirname),
		'extraResources',
		'engine',
		'engine.exe',
	);
	private constructor() {}

	public static getInstance(): EngineHandler {
		if (!EngineHandler.instance) {
			EngineHandler.instance = new EngineHandler();
		}

		return EngineHandler.instance;
	}

	public createDevEngine = (): EngineShellDev => {
		return new EngineShellDev();
	};

	public createProdEngine = (simulateProd: boolean = false): EngineShellProd => {
		if (simulateProd)
			return new EngineShellProd(EngineHandler.pathToEngineProdSimulated);

		return new EngineShellProd(EngineHandler.pathToEngineProd);
	};
}
