const isDev = require('electron-is-dev');

const isEmulatedEnvSet = 'ELECTRON_IS_EMULATED_DEV' in process.env;
const getFromEnv = Number.parseInt(process.env.ELECTRON_IS_EMULATED_DEV!, 10) === 1;

export const isEmulatedDev = isEmulatedEnvSet ? getFromEnv : isDev;
