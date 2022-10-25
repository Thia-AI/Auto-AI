import { mode, StyleFunctionProps } from '@chakra-ui/theme-tools';
export default {
	baseStyle: (props: StyleFunctionProps) => ({
		fontFamily: 'JetBrains Mono, sans-serif',
		color: mode('thia.gray.700', 'thia.gray.200')(props),
		fontWeight: 500,
		_focus: {
			boxShadow: 'none',
		},
	}),
};
