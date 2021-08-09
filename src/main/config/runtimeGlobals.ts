import { isEmulatedDev } from '../helpers/dev';
/**
 * Globals modified only during runtime
 */
const RUNTIME_GLOBALS = {
	engineRunning: false,
	isDev: isEmulatedDev,
};

export { RUNTIME_GLOBALS };
