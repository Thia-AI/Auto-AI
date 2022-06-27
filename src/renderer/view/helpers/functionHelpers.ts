import { createStandaloneToast, UseToastOptions } from '@chakra-ui/react';
import { AxiosRequestConfig } from 'axios';
import { v4 as uuidv4 } from 'uuid';

import { EngineRequestHandler } from '_/renderer/engine-requests/engineRequestHandler';
import { theme } from '_/shared/theming/chakraTheme';
import { addNotificationToStore } from './ipcHelpers';

// Random helper functions

/**
 * Helper method that waits until an Engine job has completed.
 *
 * @param jobId Job ID retrieved when starting a job.
 * @param timeout How often should it should sleep for before making the next request.
 * @returns Array of 2 -> [whether error occurred (boolean), response data (object)].
 */
export const waitTillEngineJobComplete = async (jobId: string, timeout = 1000) => {
	// TODO: Change while loop to an interval and clear interval on component unmounts

	do {
		const config: AxiosRequestConfig = {
			timeout,
		};
		const initialTime = new Date().getTime();
		const [err, resData] = await EngineRequestHandler.getInstance().getJob(jobId, config);
		if (err || resData.has_finished || resData.has_cancelled) {
			return [err, resData];
		}
		const afterTime = new Date().getTime();
		// sleep for difference
		await sleep(Math.abs(timeout - (afterTime - initialTime)));
	} while (true);
};

/**
 * Helper method that uses an interval to check if a job has finished.
 *
 * @param jobID Job ID retrieved when starting a job.
 * @param setState Set state function.
 * @param timeout How often should it should sleep for before making the next request.
 * @returns Interval ID.
 */
export const waitTillEngineJobCompleteInterval = (
	jobID: string,
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	setState: (state: [boolean, any] | null) => void,
	timeout = 1000,
) => {
	const timer = window.setInterval(async () => {
		const config: AxiosRequestConfig = {
			timeout,
		};
		const [err, resData] = await EngineRequestHandler.getInstance().getJob(jobID, config);
		if (err || resData.has_finished || resData.has_cancelled) {
			setState([err, resData]);
			clearInterval(timer);
		}
	}, timeout);
	return timer;
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

/**
 * Gets the index of the smallest element in an array along with the minimum.
 *
 * @param arr Array of numbers.
 * @returns Index of the smallest element in the array and the minimum value.
 */
export const argmin = (arr: number[] | undefined) => {
	if (!arr) return [-1, 0];
	if (arr.length === 0) return [-1, 0];

	let min = arr[0];
	let minIndex = 0;

	for (let i = 1; i < arr.length; i++) {
		if (arr[i] < min) {
			minIndex = i;
			min = arr[i];
		}
	}

	return [minIndex, min];
};

/**
 * Gets the index of the largest element in an array along with the maximum.
 *
 * @param arr Array of numbers.
 * @returns Index of the largest element in the array and the maximum value.
 */
export const argmax = (arr: number[] | undefined) => {
	if (!arr) return [-1, 0];
	if (arr.length === 0) return [-1, 0];

	let max = arr[0];
	let maxIndex = 0;

	for (let i = 1; i < arr.length; i++) {
		if (arr[i] > max) {
			maxIndex = i;
			max = arr[i];
		}
	}

	return [maxIndex, max];
};

/**
 * Returns true if a string contains whitespace or not.
 *
 * @param s String we are checking.
 * @returns Whether there is whitespace.
 */
export const hasWhiteSpace = (s: string) => {
	const whitespaceChars = [' ', '\t', '\n'];
	return whitespaceChars.some((char) => s.includes(char));
};

const { ToastContainer, toast: standaloneToast } = createStandaloneToast({ theme });

interface ToastOptions extends UseToastOptions {
	saveToStore?: boolean;
}

const DefaultToastOptions: ToastOptions = {
	saveToStore: true,
};

/**
 * Custom toast that adds data to App's notifications store.
 *
 * @param options Chakra UI `UseToastOptions`.
 * @returns Chakra UI toast ID.
 */
export const toast = (options?: ToastOptions) => {
	const extendedOptions: ToastOptions = {
		...DefaultToastOptions,
		...options,
	};
	const toastID = standaloneToast(extendedOptions);
	if (extendedOptions.saveToStore) {
		const notificationID = uuidv4();
		addNotificationToStore(notificationID, options)
			.then(() => {
				return toastID;
			})
			.catch((err) => {
				console.error(err);
				return toastID;
			});
	} else {
		return toastID;
	}
};

export { ToastContainer };
