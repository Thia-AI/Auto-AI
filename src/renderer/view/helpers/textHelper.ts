export const isFirstLetterVowel = (str: string) => {
	return ['a', 'e', 'i', 'o', 'u'].indexOf(str[0].toLowerCase()) !== -1;
};

export const formatBytesToString = (bytes, decimals = 2, k = 1024) => {
	if (bytes === 0) return '0 Bytes';

	const dm = decimals < 0 ? 0 : decimals;
	const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];

	const i = Math.floor(Math.log(bytes) / Math.log(k));

	return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
};
