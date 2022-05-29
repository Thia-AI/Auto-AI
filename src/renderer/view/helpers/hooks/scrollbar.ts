import { useColorModeValue } from '@chakra-ui/react';

/**
 * React hook returns ChakraUI `sx` property for a vertical scrollbar.
 *
 * @param scrollbarWidth Scrollbar width - default is `8px`.
 * @returns Chakra UI `sx` property.
 */
export const useVerticalScrollbar = (scrollbarWidth = '8px') => {
	const scrollBarBackground = useColorModeValue('thia.gray.100', 'thia.gray.600');
	const scrollBarThumbBackground = useColorModeValue('thia.gray.950', 'thia.gray.950');
	return {
		'&::-webkit-scrollbar': {
			w: scrollbarWidth,
			bg: scrollBarBackground,
		},
		'&::-webkit-scrollbar-thumb': {
			bg: scrollBarThumbBackground,
		},
	};
};

/**
 * React hook returns ChakraUI `sx` property for a vertical scrollbar.
 *
 * @param scrollBarHeight Scrollbar height - default is `8px`.
 * @returns Chakra UI `sx` property.
 */
export const useHorizontalScrollbar = (scrollBarHeight = '8px') => {
	const scrollBarBackground = useColorModeValue('thia.gray.100', 'thia.gray.600');
	const scrollBarThumbBackground = useColorModeValue('thia.gray.950', 'thia.gray.950');
	return {
		'&::-webkit-scrollbar': {
			h: scrollBarHeight,
			bg: scrollBarBackground,
		},
		'&::-webkit-scrollbar-thumb': {
			bg: scrollBarThumbBackground,
		},
	};
};
