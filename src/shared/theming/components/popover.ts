import { mode, cssVar, SystemStyleFunction, StyleFunctionProps } from '@chakra-ui/theme-tools';

const $popperBg = cssVar('popper-bg');
const $arrowShadowColor = cssVar('popper-arrow-shadow-color');

const baseStyleContent: SystemStyleFunction = (props) => {
	const bg = mode('thia.gray.50', 'thia.gray.700')(props);
	const shadowColor = mode('thia.gray.200', 'whiteAlpha.300')(props);
	const borderColor = mode('thia.gray.400', 'inherit')(props);
	return {
		[$popperBg.variable]: `colors.${bg}`,
		bg: $popperBg.reference,
		[$arrowShadowColor.variable]: `colors.${shadowColor}`,
		borderColor,
	};
};

export default {
	baseStyle: (props: StyleFunctionProps) => ({
		content: baseStyleContent(props),
		arrow: {
			borderColor: mode('thia.gray.400', 'inherit')(props),
		},
	}),
};
