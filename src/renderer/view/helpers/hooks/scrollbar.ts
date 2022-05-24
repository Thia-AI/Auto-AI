import { useColorModeValue } from '@chakra-ui/react';

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
