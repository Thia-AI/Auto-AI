import React, { forwardRef, useEffect, useImperativeHandle, useState } from 'react';

import {
	Box,
	ButtonGroup,
	Editable as ChakraEditable,
	EditableInput,
	EditablePreview,
	IconButton,
	Input,
	useEditableControls,
} from '@chakra-ui/react';
import { CheckIcon, CloseIcon } from '@chakra-ui/icons';
import ReactTooltip from 'react-tooltip';
import { ValidationError } from 'yup';
import { toast } from '../../helpers/functionHelpers';
import { EditableErrorText } from './EditableErrorText';
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
	initialValue: string;
	validationSchema: RequiredStringSchema<string | undefined, AnyObject>;
	onSuccess: (newValue: string) => void | Promise<void>;
}

/**
 * Editable input that acts as a text when not editing.
 */
export const Editable = React.memo(
	forwardRef<EditableModelNameHandle, Props>(({ initialValue, validationSchema, onSuccess }: Props, ref) => {
		const [value, setValue] = useState(initialValue);
		const [validValue, setValidValue] = useState(initialValue);

		const [error, setError] = useState('');

		const resetValue = (newValue: string) => {
			setValue(newValue);
			setValidValue(newValue);
		};

		useEffect(() => {
			resetValue(initialValue);
		}, [initialValue]);

		useImperativeHandle(ref, () => ({
			resetEditableValue: resetValue,
		}));

		const { data: user } = useUser();

		const onChange = async (nextValue: string) => {
			setValue(nextValue);

			try {
				const valid = await validationSchema.validate(nextValue);
				setValidValue(valid);
				setError('');
			} catch (_err) {
				const err = _err as ValidationError;
				setError(err.message);
			}
		};

		const onSubmit = async () => {
			if (!user) return;
			if (error.length > 0) {
				// Error, notify and reset
				toast({
					title: 'Failed Renaming',
					description: error,
					status: 'error',
					duration: 3500,
					isClosable: true,
					uid: user.uid,
					saveToStore: false,
				});
				setError('');
				setValue(initialValue);
			} else {
				await onSuccess(validValue);
			}
		};

		return (
			<Box>
				<ChakraEditable
					selectAllOnFocus={false}
					h='30px'
					submitOnBlur={false}
					value={value}
					onChange={onChange}
					onSubmit={onSubmit}>
					<EditablePreview py={2} px={4} data-tip data-for={`rename-${initialValue}-tooltip`} />
					<Input py={2} px={4} colorScheme='thia.gray' as={EditableInput} />
					<ReactTooltip
						id={`rename-${initialValue}-tooltip`}
						className='tooltip'
						place='bottom'
						globalEventOff='mouseout'>
						<Box as='span'>Click to rename</Box>
					</ReactTooltip>
					<EditableControls />
				</ChakraEditable>
				<EditableErrorText isError={error.length > 0} error={error} />
			</Box>
		);
	}),
);

Editable.displayName = 'EditableModelName';

const EditableControls = () => {
	const { isEditing, getSubmitButtonProps, getCancelButtonProps } = useEditableControls();

	return isEditing ? (
		<ButtonGroup justifyContent='end' size='sm' w='full' spacing={2} mt={2}>
			<IconButton aria-label='Confirm Renaming' icon={<CheckIcon />} {...getSubmitButtonProps()} />
			<IconButton aria-label='Cancel Renaming' icon={<CloseIcon boxSize={3} />} {...getCancelButtonProps()} />
		</ButtonGroup>
	) : null;
};
