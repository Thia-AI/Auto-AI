import { Box, Center, Text, useColorModeValue as mode } from '@chakra-ui/react';
import React, { useMemo } from 'react';
import { FixedSizeGrid as Grid } from 'react-window';
import AutoSizer from '../../autosizer/AutoSizer.jsx';
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

	const previewPanelTextColor = mode('thia.gray.600', 'thia.gray.400');
	const previewBG = mode('thia.gray.100', 'thia.gray.750');
	const borderColor = mode('thia.gray.150', 'thia.gray.700');
	const gridClass = mode('grid-light', 'grid-dark');
	const gridHeight = 385;
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
			borderWidth='1px'
			borderColor={borderColor}
			bg={previewBG}>
			<AutoSizer>
				{({ height, width }) => {
					if (files.length === 0)
						return (
							<Center w={width} h={height}>
								<Text fontSize='6xl' fontWeight='semibold' color={previewPanelTextColor}>
									Preview Panel
								</Text>
							</Center>
						);
					return (
						<Grid
							className={gridClass}
							style={{
								overflowY: 'hidden',
								background: previewBG,
							}}
							columnCount={columnCount}
							columnWidth={itemWidth}
							height={height}
							rowCount={rowCount}
							rowHeight={itemHeight}
							width={width}
							itemData={createItemData}>
							{DragNDropPreviewCell}
						</Grid>
					);
				}}
			</AutoSizer>
		</Box>
	);
});

DragNDropPreviewC.displayName = 'DragNDropPreview';

const mapStateToProps = (state: IAppState) => ({
	files: state.datasetPreviewFiles.value,
});

/**
 * Displays the preview cells in a grid-like fashion when adding new inputs to a dataset.
 */
export const DragNDropPreview = connect(mapStateToProps)(DragNDropPreviewC);
