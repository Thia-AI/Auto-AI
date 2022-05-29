import { mode } from '@chakra-ui/theme-tools';

// TODO: Have purple color for the menu items

export default {
	baseStyle: (props) => ({
		list: {
			bg: mode('thia.gray.50', 'thia.gray.700')(props),
			boxShadow: mode('xl', 'lg')(props),
		},
		item: {
			_hover: {
				bg: mode('thia.gray.100', 'thia.gray.600')(props),
			},
			_focus: {
				bg: mode('thia.gray.100', 'thia.gray.600')(props),
			},
			color: mode('thia.gray.700', 'thia.gray.100')(props),
		},

		divider: {
			borderColor: mode('thia.gray.200', 'inherit')(props),
		},
	}),
};
