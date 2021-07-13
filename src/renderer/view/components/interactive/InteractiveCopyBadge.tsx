import React, { useRef } from 'react';

import { Badge, Tooltip, Text, Placement } from '@chakra-ui/react';

import './InteractiveCopyBadge.css';

interface Props {
	badgeID: string | undefined;
	lengthToClip?: number;
	tooltipLabel?: string;
	tooltipPlacement?: Placement;
}

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
		<Tooltip
			label={props.tooltipLabel || 'Copy ID'}
			aria-label='A tooltip'
			fontSize='xs'
			placement={props.tooltipPlacement || 'left'}>
			<Badge
				maxW='full'
				cursor='pointer'
				ref={badgeIDRef}
				my='2'
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
		</Tooltip>
	);
});
