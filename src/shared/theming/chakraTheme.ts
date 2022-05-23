import { extendTheme } from '@chakra-ui/react';
import { mode } from '@chakra-ui/theme-tools';

import Button from './components/button';
import Modal from './components/modal';
import Form from './components/form';
import Link from './components/link';
import Drawer from './components/drawer';
import Menu from './components/menu';
import Switch from './components/switch';

export const theme = extendTheme({
	styles: {
		global: (props: any) => ({
			body: {
				bg: mode('thia.gray.50', 'thia.gray.800')(props),
				fontFamily: 'Open Sans, sans-serif',
			},
			header: {
				bg: 'thia.gray.950',
			},
			'.chakra-stack__divider': {
				borderColor: mode(
					'var(--chakra-colors-thia-gray-300) !important',
					'var(--chakra-colors-thia-gray-600) !important',
				),
				opacity: 1,
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
		/**
		 * Gray: https://coolors.co/ebebeb-d6d6d6-b8b8b8-999999-7a7a7a-525252-474747-3d3d3d-333333-292929
		 * Purple: https://coolors.co/d3c2ff-bea5ff-a785ff-8a5cff-7b47ff-5e1fff-4700ff-3500c1-26008f-1f0066
		 */
		thia: {
			gray: {
				'50': '#EBEBEB',
				'100': '#E3E3E3',
				'150': '#D6D6D6',
				'200': '#B8B8B8',
				'300': '#999999',
				'350': '#7A7A7A',
				'400': '#525252',
				'500': '#474747',
				'600': '#3D3D3D',
				'700': '#292929',
				'750': '#202020',
				'800': '#1F1F1F',
				'850': '#181717',
				'900': '#141414',
				'950': '#0A0A0A',
			},
			purple: {
				'50': '#E2D6FF',
				'100': '#D3C2FF',
				'200': '#BEA5FF',
				'250': '#A785FF',
				'300': '#8A5CFF',
				'350': '#9970FF',
				'400': '#7B47FF',
				'450': '#5E1FFF',
				'500': '#4700FF',
				'600': '#3500C1',
				'700': '#26008F',
				'800': '#1F0066',
				'900': '#12003D',
				'950': '#0C0029',
			},
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
		Drawer,
		Menu,
		Switch,
	},
	shadows: {
		outline: '#D3C2FF',
	},
});
