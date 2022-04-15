import { extendTheme } from '@chakra-ui/react';

const activeLabelStyles = {
	transform: 'scale(0.85) translateY(-24px)',
};

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
		Form: {
			variants: {
				floating: {
					container: {
						_focusWithin: {
							label: {
								...activeLabelStyles,
							},
						},
						'input:not(:placeholder-shown) + label, .chakra-select__wrapper + label': {
							...activeLabelStyles,
						},
						label: {
							top: 0,
							left: 0,
							zIndex: 2,
							position: 'absolute',
							backgroundColor: 'white',
							pointerEvents: 'none',
							mx: 3,
							px: 1,
							my: 2,
							transformOrigin: 'left top',
						},
					},
				},
			},
		},
	},
});
