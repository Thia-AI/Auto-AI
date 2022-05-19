import { extendTheme } from '@chakra-ui/react';
import { mode } from '@chakra-ui/theme-tools';

import Button from './components/button';
import Modal from './components/modal';
import Form from './components/form';
import Link from './components/link';

export const theme = extendTheme({
	styles: {
		global: (props: any) => ({
			body: {
				bg: mode('gray.100', 'gray.800')(props),
				fontFamily: 'Open Sans, sans-serif',
			},
			h4: {
				fontSize: '12px',
			},
		}),
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
		thia: {
			'bg-base': '#ffffff',
			'bg-dark': '#000000',
			'text-base': '#000000',
			'text-dark': '#ffffff',
			'purple-base': '#bea5ff',
			'purple-dark': '#3500c1',
			'purple-hover-base': '#aa89ff',
			'purple-hover-dark': '#4700ff',
		},
	},
	sizes: {
		container: {
			'2xl': '1440px',
		},
	},
	components: {
		Button,
		Link,
		Modal,
		Form,
	},
});
