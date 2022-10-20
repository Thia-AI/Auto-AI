/**
 * Copy from Chakra UI Skeleton theme source with default color modification.
 * https://github.com/chakra-ui/chakra-ui/blob/main/packages/theme/src/components/skeleton.ts
 */

import { keyframes } from '@chakra-ui/system';
import type { StyleFunctionProps, SystemStyleFunction } from '@chakra-ui/theme-tools';
import { getColor, mode } from '@chakra-ui/theme-tools';

const fade = (startColor: string, endColor: string) =>
	keyframes({
		from: { borderColor: startColor, background: startColor },
		to: { borderColor: endColor, background: endColor },
	});

const baseStyle: SystemStyleFunction = (props: StyleFunctionProps) => {
	const defaultStartColor = mode('thia.gray.100', 'thia.gray.850')(props);
	const defaultEndColor = mode('thia.gray.300', 'thia.gray.700')(props);

	const { startColor = defaultStartColor, endColor = defaultEndColor, speed, theme } = props;

	const start = getColor(theme, startColor);
	const end = getColor(theme, endColor);

	return {
		opacity: 0.7,
		borderRadius: '2px',
		borderColor: start,
		background: end,
		animation: `${speed}s linear infinite alternate ${fade(start, end)}`,
	};
};

export default {
	baseStyle,
};
