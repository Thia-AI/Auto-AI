import { Box, Center, Text } from '@chakra-ui/react';
import React, { useMemo } from 'react';
import { FixedSizeGrid } from 'react-window';
import AutoSizer from './AutoSizer.jsx';
import { DragNDropPreviewCell } from './PreviewCell';
import { connect } from 'react-redux';
import { IAppState } from '_/renderer/state/reducers';

import './DragNDropPreview.css';

interface DragProps {
	files: string[];
	directory: string;
}
const DragNDropPreviewC = React.memo((props: DragProps) => {
	const { files, directory } = props;

	const gridHeight = 520;
	const itemHeight = 125;
	const itemWidth = 125;
	const gridContainerPadding = 12;
	const rowCount = Math.round(gridHeight / itemHeight);
	const columnCount = files.length / rowCount + 1;

	const createItemData = useMemo(
		() => ({
			directory,
			rowCount,
		}),
		[rowCount, directory],
	);
	return (
		<Box
			w='full'
			p={gridContainerPadding + 'px'}
			borderRadius='sm'
			h={gridHeight + 2 * gridContainerPadding + 'px'}
			mb='4'
			bg='gray.750'>
			<AutoSizer>
				{({ height, width }) => {
					if (files.length === 0)
						return (
							<Center w={width} h={height}>
								<Text fontSize='6xl' fontWeight='semibold' color='gray.700'>
									Preview Panel
								</Text>
							</Center>
						);
					return (
						<FixedSizeGrid
							className='drag-drop-preview'
							columnCount={columnCount}
							columnWidth={itemWidth}
							height={height}
							rowCount={rowCount}
							rowHeight={itemHeight}
							width={width}
							itemData={createItemData}>
							{DragNDropPreviewCell}
						</FixedSizeGrid>
					);
				}}
			</AutoSizer>
		</Box>
	);
});
const mapStateToProps = (state: IAppState) => ({
	files: state.datasetPreviewFiles.value,
});

/**
 * Displays the preview cells in a grid-like fashion when adding new inputs to a dataset.
 */
export const DragNDropPreview = connect(mapStateToProps)(DragNDropPreviewC);
