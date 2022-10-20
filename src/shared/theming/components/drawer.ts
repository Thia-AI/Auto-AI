import { mode, StyleFunctionProps } from '@chakra-ui/theme-tools';
export default {
	baseStyle: (props: StyleFunctionProps) => ({
		dialog: {
			bg: mode('thia.gray.50', 'thia.gray.900')(props),
		},
	}),
};
