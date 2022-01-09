import { useEffect, useState } from 'react';

/**
 * Hook used for lazy loading an image.
 *
 * @param src Location of image (can be local file with file:// preceeding the local file or an HTTP retrievable file).
 * @param readyToLoad Whether the image is ready to be loaded (for example if we don't yet have the `src` since that is also being retrieved by another hook).
 * @returns Whether the image has been loaded and its `src`.
 */
export const useProgressiveImage = (src: string, readyToLoad = true): [boolean, string] => {
	const [sourceLoaded, setSourceLoaded] = useState('');
	const [imageLoaded, setImageLoaded] = useState(false);

	useEffect(() => {
		let img: HTMLImageElement | null = null;
		if (readyToLoad) {
			img = new Image();
			img.src = src;
			img.onload = () => {
				setSourceLoaded(src);
				setImageLoaded(true);
			};
		}

		return () => {
			img = null;
		};
	}, [src, readyToLoad]);

	return [imageLoaded, sourceLoaded];
};
