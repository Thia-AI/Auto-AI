import { mode, StyleFunctionProps } from '@chakra-ui/theme-tools';

export default {
	baseStyle: (props: StyleFunctionProps) => ({
		header: {
			fontWeight: {
				base: 500,
				lg: 600,
				'2xl': 700,
			},
			fontFamily: 'Poppins, sans-serif',
			fontSize: {
				base: 'xl',
				lg: '2xl',
				'2xl': '3xl',
			},
			bg: mode('thia.gray.50', 'thia.gray.800')(props),
		},

		dialog: {
			bg: mode('thia.gray.50', 'thia.gray.800')(props),
		},

		closeButton: {
			_focus: {
				boxShadow: 'none',
			},
		},
	}),
};
