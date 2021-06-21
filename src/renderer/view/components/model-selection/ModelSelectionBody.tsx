import React, { PureComponent } from 'react';
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

class ModelSelectionBodyC extends PureComponent<Props> {
	renderBody = (selectedModel: number) => {
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

	render() {
		return <Box mt='6'>{this.renderBody(this.props.selectedModel.value)}</Box>;
	}
}

const mapStateToProps = (state: IAppState) => ({
	selectedModel: state.selectedModel,
});

export const ModelSelectionBody = connect(mapStateToProps)(ModelSelectionBodyC);
