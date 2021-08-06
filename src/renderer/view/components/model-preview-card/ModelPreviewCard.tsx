import React, { PureComponent } from 'react';
import { Box, Image, Divider, Flex, Badge, Tooltip } from '@chakra-ui/react';
import { connect } from 'react-redux';
import LazyLoad from 'react-lazyload';

import { changeSelectedModelAction } from '_renderer/state/choose-model/ChooseModelActions';

import './ModelPreviewCard.css';
import { IChangeSelectedModelAction } from '_/renderer/state/choose-model/model/actionTypes';

interface Props {
	imageSrc: string;
	badge: string;
	badgeColorScheme: string;
	cardTitle: string;
	cardDescription: string;
	updatedDate: string;
	selectedModelNumber: number;
	changeSelectedModelAction: (modelNumber: number) => IChangeSelectedModelAction;
}

class ModelPreviewCardC extends PureComponent<Props> {
	render() {
		return (
			<Box
				boxShadow='xl'
				minW='275px'
				maxH='lg'
				// borderWidth='1px'
				borderTopWidth='1px'
				borderRadius='lg'
				overflow='hidden'
				cursor='pointer'
				onClick={() =>
					this.props.changeSelectedModelAction(this.props.selectedModelNumber)
				}>
				<LazyLoad>
					<Image
						src={this.props.imageSrc}
						alt='Image'
						htmlWidth='275px'
						fit='cover'
						borderTopRadius='lg'
						borderColor='gray.900'
					/>
				</LazyLoad>

				<Divider w='full' />
				<Box pt='6' pb='4' px='6'>
					<Flex align='baseline' justify='center'>
						<Badge borderRadius='full' px='2' colorScheme={this.props.badgeColorScheme}>
							{this.props.badge}
						</Badge>
						<Box
							flexGrow={2}
							color='gray.500'
							fontWeight='semibold'
							letterSpacing='wide'
							fontSize='xs'
							textTransform='uppercase'
							ml='2'>
							{this.props.cardTitle}
						</Box>
					</Flex>
					<Box
						mt='1'
						fontWeight='medium'
						as='h5'
						lineHeight='tight'
						isTruncated
						fontSize='md'>
						{this.props.cardDescription}
					</Box>
					<Box as='p' mt='2' color='gray.600' fontSize='xs'>
						Updated {this.props.updatedDate}
					</Box>
				</Box>
			</Box>
		);
	}
}
const mapStateToProps = () => ({});
export const ModelPreviewCard = connect(mapStateToProps, { changeSelectedModelAction })(
	ModelPreviewCardC,
);
