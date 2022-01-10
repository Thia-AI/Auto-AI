import React, { useRef } from 'react';

import { Badge, Text } from '@chakra-ui/react';

import './InteractiveCopyBadge.css';

interface Props {
	badgeID: string | undefined;
	lengthToClip?: number;
	hoverLabel?: string;
}
/**
 * A badge that allows for copying on click.
 */
export const InteractiveCopyBadge = React.memo((props: Props) => {
	const badgeIDRef = useRef<HTMLDivElement>(null);

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
			my='2'
			title={props.hoverLabel ?? 'Copy ID'}
			px='1'
			opacity='0.6'
			bg='gray.900'
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
			<Text w='full' h='full' color='gray.600' isTruncated>
				{renderBadgeID()}
			</Text>
		</Badge>
	);
});
