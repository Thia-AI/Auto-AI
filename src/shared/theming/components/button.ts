import { mode, whiten, darken, StyleFunctionProps, SystemStyleFunction, transparentize } from '@chakra-ui/theme-tools';

/**
 * Extended theme for ghost and outline variants of the button.
 *
 * @param props Style props.
 * @returns Extended theme.
 */
const variantGhostOutlineExtended = (props: StyleFunctionProps) => {
	const { colorScheme: c, theme } = props;

	if (c == 'thia.gray') {
		// Only overriding _hover and _active pseudo style props as it doesn't work
		// well with thia.gray color scheme in light mode.
		const darkHoverBg = transparentize(`${c}.200`, 0.12)(theme);
		const darkActiveBg = transparentize(`${c}.200`, 0.24)(theme);
		return {
			_hover: {
				bg: mode(`${c}.150`, darkHoverBg)(props),
			},
			_active: {
				bg: mode(`${c}.200`, darkActiveBg)(props),
			},
		};
	}
	return {};
};

export default {
	// Styles for the base style
	baseStyle: {
		_focus: { boxShadow: 'none' },
	},
	// Styles for the size variations
	sizes: {},
	// Styles for the visual style variations
	variants: {
		ghost: variantGhostOutlineExtended,
		outline: variantGhostOutlineExtended,
	},
	// The default `size` or `variant` values
	defaultProps: {},
};
