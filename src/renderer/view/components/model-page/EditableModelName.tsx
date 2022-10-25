import React, { forwardRef, useEffect, useImperativeHandle, useState } from 'react';

import {
	Box,
	ButtonGroup,
	Editable,
	EditableInput,
	EditablePreview,
	IconButton,
	Input,
	useEditableControls,
} from '@chakra-ui/react';
import { Model } from '../../helpers/constants/engineTypes';
import { CheckIcon, CloseIcon } from '@chakra-ui/icons';
import ReactTooltip from 'react-tooltip';
import { ValidationError } from 'yup';
import { toast } from '../../helpers/functionHelpers';
import { EditableModelNameError } from './EditableModelNameError';
import { useUser } from 'reactfire';
import { RequiredStringSchema } from 'yup/lib/string';
import { AnyObject } from 'yup/lib/types';

/**
 * useImperativeHandle data.
 */
export interface EditableModelNameHandle {
	resetEditableValue: (newValue: string) => void;
}

interface Props {
	model: Model;
	validationSchema: RequiredStringSchema<string | undefined, AnyObject>;
	onSuccess: (newValue: string) => void | Promise<void>;
}

/**
 * Editable input that acts as a text when not editing.
 */
export const EditableModelName = React.memo(
	forwardRef<EditableModelNameHandle, Props>(({ model, validationSchema, onSuccess }: Props, ref) => {
		const [value, setValue] = useState(model.model_name);
		const [validValue, setValidValue] = useState(model.model_name);

		const [modelNameError, setModelNameError] = useState('');

		const resetValue = (newValue: string) => {
			setValue(newValue);
			setValidValue(newValue);
		};

		useImperativeHandle(ref, () => ({
			resetEditableValue: resetValue,
		}));

		const { data: user } = useUser();

		const onChange = async (nextValue: string) => {
			setValue(nextValue);

			try {
				const valid = await validationSchema.validate(nextValue);
				setValidValue(valid);
				setModelNameError('');
			} catch (_err) {
				const err = _err as ValidationError;
				setModelNameError(err.message);
			}
		};

		const onSubmit = async () => {
			if (!user) return;
			if (modelNameError.length > 0) {
				// Error, notify and reset
				toast({
					title: 'Failed Renaming',
					description: modelNameError,
					status: 'error',
					duration: 3500,
					isClosable: true,
					uid: user.uid,
					saveToStore: false,
				});
				setModelNameError('');
				setValue(model.model_name);
			} else {
				await onSuccess(validValue);
			}
		};

		return (
			<Box>
				<Editable
					selectAllOnFocus={false}
					h='30px'
					submitOnBlur={false}
					value={value}
					onChange={onChange}
					onSubmit={onSubmit}>
					<EditablePreview py={2} px={4} data-tip data-for={`rename-${model.model_name}-tooltip`} />
					<Input py={2} px={4} colorScheme='thia.gray' as={EditableInput} />
					<ReactTooltip
						id={`rename-${model.model_name}-tooltip`}
						className='tooltip'
						place='bottom'
						globalEventOff='mouseout'>
						<Box as='span'>Click to rename</Box>
					</ReactTooltip>
					<EditableControls />
				</Editable>
				<EditableModelNameError isError={modelNameError.length > 0} error={modelNameError} />
			</Box>
		);
	}),
);

EditableModelName.displayName = 'EditableModelName';

const EditableControls = () => {
	const { isEditing, getSubmitButtonProps, getCancelButtonProps } = useEditableControls();

	return isEditing ? (
		<ButtonGroup justifyContent='end' size='sm' w='full' spacing={2} mt={2}>
			<IconButton aria-label='Confirm Renaming' icon={<CheckIcon />} {...getSubmitButtonProps()} />
			<IconButton aria-label='Cancel Renaming' icon={<CloseIcon boxSize={3} />} {...getCancelButtonProps()} />
		</ButtonGroup>
	) : null;
};
