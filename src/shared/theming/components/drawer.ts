import { mode } from '@chakra-ui/theme-tools';
export default {
	baseStyle: (props) => ({
		dialog: {
			bg: mode('thia.gray.50', 'thia.gray.900')(props),
		},
	}),
};
