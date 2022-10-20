import { mode, StyleFunctionProps } from '@chakra-ui/theme-tools';

export default {
	baseStyle: (props: StyleFunctionProps) => ({
		preview: {
			_hover: {
				bg: mode('thia.gray.150', 'thia.gray.600')(props),
			},
		},
	}),
};
