import { Flex } from '@chakra-ui/react';
import React, { useEffect } from 'react';
import { connect } from 'react-redux';
import {
	getNextPageInputsAction,
	resetActiveDatasetInputsAction,
} from '_/renderer/state/active-dataset-inputs/ActiveDatasetInputsActions';
import { IResetActiveDatasetInputsAction } from '_/renderer/state/active-dataset-inputs/model/actionTypes';
import { IActiveDatasetInputsReducer } from '_/renderer/state/active-dataset-inputs/model/reducerTypes';
import { IAppState } from '_/renderer/state/reducers';
import { InputPreviewLabels } from './InputPreviewLabels';
import { PreviewDatasetInput } from './PreviewDatasetInput';
import { PreviewDatasetPagination } from './PreviewDatasetPagination';

interface Props {
	pathname: string;
	activeDatasetInputs: IActiveDatasetInputsReducer;
	getNextPageInputs: (datasetID: string, cursorDate: string) => void;
	resetPageInputs: () => IResetActiveDatasetInputsAction;
}

const InputPreviewC = React.memo((props: Props) => {
	// Dataset ID from pathname. Pathname should be /dataset/<dataset-id>
	const datasetID: string = props.pathname.split('/').pop()!;

	useEffect(() => {
		// Get next pages from oldest date possible.
		const someOldDateBase64 = Buffer.from(new Date(0).toLocaleString()).toString('base64');
		props.getNextPageInputs(datasetID, someOldDateBase64);
		return () => {
			// Reset active inputs.
			props.resetPageInputs();
		};
	}, []);

	return (
		<Flex
			w='full'
			h='full'
			mx='2'
			flexDir='column'
			borderTopRightRadius='sm'
			borderBottomRightRadius='sm'
			overflow='hidden'>
			<Flex w='full' h='78%' minH='78%' maxH='78%' flexDir='row'>
				<PreviewDatasetInput w='70%' />
				<InputPreviewLabels w='30%' h='full' />
			</Flex>
			<PreviewDatasetPagination h='20%' />
		</Flex>
	);
});

const mapStateToProps = (state: IAppState) => ({
	activeDatasetInputs: state.activeDatasetInputs,
	pathname: state.router.location.pathname,
});

/**
 * Preview of a dataset's inputs (or images).
 */
export const InputPreview = connect(mapStateToProps, {
	getNextPageInputs: getNextPageInputsAction,
	resetPageInputs: resetActiveDatasetInputsAction,
})(InputPreviewC);
