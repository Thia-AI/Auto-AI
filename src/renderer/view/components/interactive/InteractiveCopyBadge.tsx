import React, { useRef } from 'react';

import { Badge, Text, TypographyProps, useColorModeValue as mode } from '@chakra-ui/react';

import './InteractiveCopyBadge.css';

interface Props {
	badgeID: string | undefined | null;
	lengthToClip?: number;
	hoverLabel?: string;
	fontSize?: TypographyProps['fontSize'];
}
/**
 * A badge that allows for copying on click.
 */
export const InteractiveCopyBadge = React.memo((props: Props) => {
	const badgeIDRef = useRef<HTMLDivElement>(null);
	const badgeBG = mode('thia.gray.950', 'thia.gray.950');
	const color = mode('thia.gray.200', 'thia.gray.200');

	const renderBadgeID = () => {
		if (!props.badgeID) return '';

		if (props.lengthToClip) {
			return props.badgeID.substring(0, props.lengthToClip);
		} else {
			return props.badgeID;
		}
	};
	return (
		<Badge
			maxW='full'
			cursor='pointer'
			ref={badgeIDRef}
			fontSize={props.fontSize ?? 'xs'}
			my='2'
			title={props.hoverLabel ?? 'Copy ID'}
			px='1'
			opacity='0.6'
			bg={badgeBG}
			onClick={(e) => {
				// Prevent onclick from propogating up
				e.stopPropagation();
				// Notify via tooltip of copy
				// Add bouncing animation and copy model ID to clipboard
				badgeIDRef.current?.classList.add('copy-bounce');
				navigator.clipboard.writeText(props.badgeID ? props.badgeID : '');
				// remove bouncing animation after it's finished
				setTimeout(() => {
					if (badgeIDRef.current) {
						badgeIDRef.current.classList.remove('copy-bounce');
					}
				}, 150);
			}}>
			<Text w='full' h='full' color={color} noOfLines={1}>
				{renderBadgeID()}
			</Text>
		</Badge>
	);
});

InteractiveCopyBadge.displayName = 'InteractiveCopyBadge';
