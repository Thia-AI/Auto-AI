import { url } from 'inspector';
import React, { Component } from 'react';

import './ImageClassificationSelection.css';

class ImageClassificationSelection extends Component {
	render() {
		return (
			<div className='image-classification-selection'>
				<div className='description-header'>
					<div className='description-header-image-wrapper'>
						<div
							className='description-header-image'
							style={{
								backgroundImage: `url('https://i.pinimg.com/originals/68/7c/ea/687cea8aabd579611223b9f6332f1cbb.gif')`,
							}}
						/>
					</div>
					<div className='description-header-vertical-divider' />
					<div className='description-header-info'>
						<div className='description-header-info-inner'>
							<h1>Image Classification</h1>
							<p className='description-header-info-body'>
								Model Description
							</p>
						</div>
					</div>
				</div>
			</div>
		);
	}
}

export default ImageClassificationSelection;
