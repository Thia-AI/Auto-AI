import { mode, SystemStyleFunction, StyleFunctionProps, cssVar } from '@chakra-ui/theme-tools';

const $width = cssVar('switch-track-width');
const $height = cssVar('switch-track-height');

export default {
	baseStyle: (props: StyleFunctionProps) => {
		const { colorScheme: c } = props;
		return {
			thumb: {
				bg: mode('thia.gray.800', 'thia.gray.100')(props),
			},
			track: {
				bg: mode(`${c}.50`, 'whiteAlpha.400')(props),
				_checked: {
					bg: mode(`${c}.300`, `${c}.400`)(props),
				},
			},
		};
	},
};
