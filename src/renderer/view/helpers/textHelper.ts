/**
 * Checks whether first letter is a vowel.
 *
 * @param str String to check.
 * @returns `true` if first letter is vowel.
 */
export const isFirstLetterVowel = (str: string) => {
	return ['a', 'e', 'i', 'o', 'u'].indexOf(str[0].toLowerCase()) !== -1;
};

/**
 * Formats bytes to a string representation.
 *
 * @param bytes Number of bytes.
 * @param decimals  Number of decimals to format.
 * @param k Number of bytes -> kilo byte.
 * @returns Formatted string representation.
 */
export const formatBytesToString = (bytes: number, decimals = 2, k = 1024) => {
	if (bytes === 0) return '0 Bytes';

	const dm = decimals < 0 ? 0 : decimals;
	const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];

	const i = Math.floor(Math.log(bytes) / Math.log(k));

	return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
};
