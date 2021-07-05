export const isFirstLetterVowel = (str: string) => {
	return ['a', 'e', 'i', 'o', 'u'].indexOf(str[0].toLowerCase()) !== -1;
};
