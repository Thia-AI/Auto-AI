import { extendTheme } from '@chakra-ui/react';

export const theme = extendTheme({
	styles: {
		global: {
			body: {
				backgroundColor: 'gray.800',
			},
		},
	},
	config: {
		initialColorMode: 'dark',
		useSystemColorMode: false,
	},
	colors: {
		gray: {
			750: '#242d3b',
			850: '#171d29',
		},
		red: {
			450: '#f25757',
		},
		green: {
			450: '#2fa862',
		},
	},

	components: {
		Button: {
			baseStyle: {
				_focus: {
					boxShadow: 'none',
				},
			},
		},
	},
});
