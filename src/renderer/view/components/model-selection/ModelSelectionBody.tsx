import React from 'react';
import { connect } from 'react-redux';
import { Box } from '@chakra-ui/react';

import { IAppState } from '_/renderer/state/reducers';
import { ISelectedModelReducer } from '_/renderer/state/choose-model/model/reducerTypes';

import { GModelContent } from '../model-selection/content/generative/GModelContent';
import { ICModelContent } from '../model-selection/content/image_classification/ICModelContent';
import { ODModelContent } from '../model-selection/content/object_detection/ODModelContent';
import { OTModelContent } from '../model-selection/content/object_tracking/OTModelContent';

interface Props {
	selectedModel: ISelectedModelReducer;
}

const ModelSelectionBodyC = React.memo(({ selectedModel }: Props) => {
	const renderBody = (selectedModel: number) => {
		switch (selectedModel) {
			case 0:
				return <ICModelContent />;
			case 1:
				return <ODModelContent />;
			case 2:
				return <OTModelContent />;
			case 3:
				return <GModelContent />;
		}
	};

	return <Box mt='6'>{renderBody(selectedModel.value)}</Box>;
});

ModelSelectionBodyC.displayName = 'ModelSelectionBody';

const mapStateToProps = (state: IAppState) => ({
	selectedModel: state.selectedModel,
});

/**
 * Manages which model description to display when creating a new model.
 */
export const ModelSelectionBody = connect(mapStateToProps)(ModelSelectionBodyC);
