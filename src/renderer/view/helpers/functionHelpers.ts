import { AxiosRequestConfig } from 'axios';

import { EngineActionHandler } from '_engine_requests/engineActionHandler';

// Random helper functions

/**
 * Helper method that waits until an Engine job has completed.
 *
 * @param jobId Job ID retrieved when starting a job.
 * @param timeout How often should it should sleep for before making the next request.
 * @returns Array of 2 -> [whether error occurred (boolean), response data (object)].
 */
export const waitTillEngineJobComplete = async (jobId: string, timeout = 1000) => {
	do {
		const config: AxiosRequestConfig = {
			timeout,
		};
		const initialTime = new Date().getTime();
		const [err, resData] = await EngineActionHandler.getInstance().getJob(jobId, config);
		if (err || resData.has_finished) {
			return [err, resData];
		}
		const afterTime = new Date().getTime();
		// sleep for difference
		await sleep(Math.abs(timeout - (afterTime - initialTime)));
	} while (true);
};

/**
 * Helper method to sleep in async/await.
 *
 * @param ms Milliseconds to sleep for.
 * @returns A {@link Promise `promise`} that needs to be `await`-ed.
 */
export const sleep = (ms: number) => {
	return new Promise((resolve) => setTimeout(resolve, ms));
};

/**
 * Converts image resolution into megapixels.
 *
 * @param width Width of image.
 * @param height Height of image.
 * @returns Megapixels of the image.
 */
export const resolutionToMegapixels = (width: number, height: number) => {
	return (width * height) / 1_000_000;
};

// Color Helpers

type MAX_RGB_VALUE = 255;

type Mapped<N extends number, Result extends Array<unknown> = []> = Result['length'] extends N
	? Result
	: Mapped<N, [...Result, Result['length']]>;

/**
 * Type that represents a number in the RGB space (0-255).
 */
export type RGBNumberRange = Mapped<MAX_RGB_VALUE>[number];

/**
 * Type guard for checking whether a number is within the valid RGB number range or not.
 *
 * @param toBeDetermined RGB number.
 * @returns Whether number is a valid RGB number or not.
 */
export const rgbTypeGuard = (toBeDetermined: number): toBeDetermined is RGBNumberRange => {
	if ((toBeDetermined as RGBNumberRange) >= 0 && (toBeDetermined as RGBNumberRange) <= 255) {
		return true;
	}

	return false;
};

/**
 * Type for an RGB color value.
 */
export type RGBValue = [RGBNumberRange, RGBNumberRange, RGBNumberRange];

/**
 * Gets Delta E difference of two RGB colors.
 * See: https://stackoverflow.com/questions/13586999/color-difference-similarity-between-two-values-with-js.
 *
 * @param rgbA First color.
 * @param rgbB Second color.
 * @returns Distance between the colors.
 */
export const colorDifference = (rgbA: RGBValue, rgbB: RGBValue) => {
	const labA = rgb2LabSpace(rgbA);
	const labB = rgb2LabSpace(rgbB);
	const deltaL = labA[0] - labB[0];
	const deltaA = labA[1] - labB[1];
	const deltaB = labA[2] - labB[2];
	const c1 = Math.sqrt(labA[1] * labA[1] + labA[2] * labA[2]);
	const c2 = Math.sqrt(labB[1] * labB[1] + labB[2] * labB[2]);
	const deltaC = c1 - c2;
	let deltaH = deltaA * deltaA + deltaB * deltaB - deltaC * deltaC;
	deltaH = deltaH < 0 ? 0 : Math.sqrt(deltaH);
	const sc = 1.0 + 0.045 * c1;
	const sh = 1.0 + 0.015 * c1;
	const deltaLKlsl = deltaL / 1.0;
	const deltaCkcsc = deltaC / sc;
	const deltaHkhsh = deltaH / sh;
	const i = deltaLKlsl * deltaLKlsl + deltaCkcsc * deltaCkcsc + deltaHkhsh * deltaHkhsh;
	return i < 0 ? 0 : Math.sqrt(i);
};

const rgb2LabSpace = (rgb: RGBValue) => {
	let r = rgb[0] / 255,
		g = rgb[1] / 255,
		b = rgb[2] / 255,
		x,
		y,
		z;
	r = r > 0.04045 ? Math.pow((r + 0.055) / 1.055, 2.4) : r / 12.92;
	g = g > 0.04045 ? Math.pow((g + 0.055) / 1.055, 2.4) : g / 12.92;
	b = b > 0.04045 ? Math.pow((b + 0.055) / 1.055, 2.4) : b / 12.92;
	x = (r * 0.4124 + g * 0.3576 + b * 0.1805) / 0.95047;
	y = (r * 0.2126 + g * 0.7152 + b * 0.0722) / 1.0;
	z = (r * 0.0193 + g * 0.1192 + b * 0.9505) / 1.08883;
	x = x > 0.008856 ? Math.pow(x, 1 / 3) : 7.787 * x + 16 / 116;
	y = y > 0.008856 ? Math.pow(y, 1 / 3) : 7.787 * y + 16 / 116;
	z = z > 0.008856 ? Math.pow(z, 1 / 3) : 7.787 * z + 16 / 116;
	return [116 * y - 16, 500 * (x - y), 200 * (y - z)];
};
