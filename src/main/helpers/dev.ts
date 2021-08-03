const isDev = require('electron-is-dev');

const isEmulatedEnvSet = 'ELECTRON_IS_EMULATED_DEV' in process.env;
// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
const getFromEnv = Number.parseInt(process.env.ELECTRON_IS_EMULATED_DEV!, 10) === 1;

export const isEmulatedDev: boolean = isEmulatedEnvSet ? getFromEnv : isDev;
