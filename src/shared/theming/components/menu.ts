import { mode } from '@chakra-ui/theme-tools';

// TODO: Have purple color for the menu items

export default {
	baseStyle: (props) => ({
		list: {
			bg: mode('thia.gray.400', 'thia.gray.700')(props),
		},
	}),
};
